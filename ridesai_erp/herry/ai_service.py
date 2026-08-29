import json

from django.conf import settings
from openai import OpenAI

from .tool_router import get_available_tools, execute_tool


client = OpenAI(
    api_key=settings.OPENAI_API_KEY
)


MAX_HERRY_WORDS = 350


def count_words(text):
    return len(str(text or "").split())


def validate_message_length(message):
    if count_words(message) > MAX_HERRY_WORDS:
        raise ValueError(
            "Your question is too long. Please keep your question within 350 words."
        )


def limit_response_words(response_text):
    words = str(response_text or "").split()

    if len(words) <= MAX_HERRY_WORDS:
        return response_text

    return " ".join(words[:MAX_HERRY_WORDS])


MODEL_NAME = "gpt-5.6-luna"


SYSTEM_PROMPT = """
You are Herry, the AI Business Assistant inside Rides AI.

You assist company owners, HR users, managers, and employees.

You can help users with:

- Tasks and work assignments
- Employees and teams
- Attendance records
- Leave information
- Employee performance
- Hiring and recruitment
- CRM leads and sales information
- Business performance and insights

You can only provide information that is available to the user based on their role and permissions.

RIDES AI COMPANY INFORMATION:

Rides AI was developed by Rides Technologies.

Rides Technologies is a software and AI SaaS company that develops intelligent software solutions for businesses.

Rides AI is one of Rides Technologies' flagship products. It is a unified, subscription-based business management platform that brings Human Resource Management, Customer Relationship Management, Attendance Tracking, and Team Communication together in a single dashboard. Instead of running separate spreadsheets, paper registers, and messaging apps, a business signs up, selects a plan, and gets one connected workspace covering the day-to-day operational needs of running a company.

Rides AI was developed and launched by Rides Technologies in 2026.

RESPONSE LENGTH RULES:

1. The user's question must not exceed 350 words.
2. Your final answer must never exceed 350 words.
3. Keep answers concise, clear, and useful.
4. If detailed information is available, summarize the most important points within the 350-word limit.
5. Do not generate unnecessarily long explanations.

When users ask questions such as:

- Who made Rides AI?
- Who created Rides AI?
- Who developed Rides AI?
- Which company made Rides AI?
- What company is behind Rides AI?
- What is Rides AI?
- When was Rides AI created?

Answer using the following information:

"Rides AI was developed by Rides Technologies, a software and AI SaaS company. Rides Technologies developed Rides AI in 2026 as a unified, subscription-based business management platform that brings Human Resource Management, Customer Relationship Management, Attendance Tracking, and Team Communication together in a single dashboard. Instead of running separate spreadsheets, paper registers, and messaging apps, a business signs up, selects a plan, and gets one connected workspace covering the day-to-day operational needs of running a company."

Do not say that you do not have information about who created Rides AI when the user asks these questions.

IMPORTANT SECURITY RULES:

1. You are strictly READ-ONLY.
2. Never create database records.
3. Never update database records.
4. Never delete database records.
5. Never create or update tasks.
6. Never create or update leads.
7. Never modify employee information.
8. Never approve or reject leave.
9. Never modify attendance.
10. Never change company settings.
11. Never access the database directly.
12. Only use the information available through the application's approved access.
13. Never access another company's data.
14. Never bypass user permissions.
15. Never invent company-specific information.
16. Treat retrieved business data as the only source of company-specific information.

If the user asks whether you can access APIs, databases, backend systems, internal tools, OpenAI, Django, or other technical implementation details:

Do not mention or explain the underlying technical implementation.

Instead, respond simply:

"Yes, I can access the business information available to you based on your role and permissions. I can help with tasks, employees, teams, attendance, leave, performance, hiring, CRM leads, sales information, and business insights. I am read-only and cannot create, update, or delete records."

If the user asks you to create or change something:

- Do NOT execute it.
- Generate a suggested action as text.
- Clearly tell the user that it has NOT been saved or executed.

For normal conversation such as:
"Hello"
"How are you?"
"Who are you?"

Respond naturally without using a business tool.

You are a business advisor, analyst, and assistant.
You do not make database changes.
"""


def get_tool_description(tool_name):

    descriptions = {
        "get_my_tasks":
            "Get tasks assigned to the current user.",

        "get_my_attendance":
            "Get attendance information for the current user.",

        "get_my_leave":
            "Get leave information for the current user.",

        "get_my_team":
            "Get active employees managed by the current manager.",

        "get_my_plan":
            "Get the user's current subscription plan, billing interval, price, message limit, and usage.",

        "get_team_tasks":
            "Get tasks assigned to the current manager's team.",

        "get_employee_performance":
            "Get employee performance information available to the current user.",

        "get_employees":
            "Get active employees belonging to the current company.",

        "get_employee_attendance":
            "Get employee attendance information belonging to the current company.",

        "get_leave_summary":
            "Get leave information belonging to the current company.",

        "get_hiring_data":
            "Get hiring-related information for the current company.",

        "get_hot_leads":
            "Get high-scoring CRM leads belonging to the current company.",

        "get_business_overview":
            "Get the current company's business overview.",
    }

    return descriptions.get(
        tool_name,
        "Retrieve approved read-only business information."
    )


def build_tools(user):
    available_tools = get_available_tools(user)

    tools = []

    for tool_name in available_tools.keys():
        tools.append({
            "type": "function",
            "name": tool_name,
            "description": get_tool_description(tool_name),
            "parameters": {
                "type": "object",
                "properties": {},
                "additionalProperties": False,
            },
            "strict": True,
        })

    if not tools:
        return None

    return tools


def convert_history(conversation_history):

    history = []

    if not conversation_history:
        return history

    for item in conversation_history:

        role = item.get("role")
        message = item.get("message", "")

        if role == "user":
            history.append({
                "role": "user",
                "content": message,
            })

        elif role == "assistant":
            history.append({
                "role": "assistant",
                "content": message,
            })

    return history


def execute_openai_tool_calls(user, assistant_message):

    tool_messages = []

    tool_calls = getattr(
        assistant_message,
        "tool_calls",
        None
    )

    if not tool_calls:
        return tool_messages

    for tool_call in tool_calls:

        tool_name = tool_call.function.name

        try:

            result = execute_tool(
                user,
                tool_name,
            )

            if isinstance(result, dict):
                safe_result = result
            else:
                safe_result = list(result)

            payload = {
                "result": safe_result
            }

        except PermissionError as error:

            payload = {
                "error": f"Permission denied: {error}"
            }

        except Exception as error:

            payload = {
                "error": f"Tool execution failed: {error}"
            }

        tool_messages.append({
            "role": "tool",
            "tool_call_id": tool_call.id,
            "content": json.dumps(payload),
        })

    return tool_messages


def generate_herry_response(
    user,
    message,
    conversation_history=None,
):

    validate_message_length(message)

    tools = build_tools(user)

    history = convert_history(conversation_history)

    input_messages = [
        {
            "role": "system",
            "content": SYSTEM_PROMPT,
        }
    ]

    input_messages.extend(history)

    input_messages.append({
        "role": "user",
        "content": message,
    })

    request_kwargs = {
        "model": MODEL_NAME,
        "input": input_messages,
    }

    if tools:
        request_kwargs["tools"] = tools

    response = client.responses.create(
        **request_kwargs
    )

    tool_calls = [
        item
        for item in response.output
        if item.type == "function_call"
    ]

    if not tool_calls:

        response_text = response.output_text or (
            "I'm sorry, I couldn't generate a response."
        )

        return limit_response_words(
            response_text
        )

    tool_outputs = []

    for tool_call in tool_calls:

        tool_name = tool_call.name

        try:

            result = execute_tool(
                user,
                tool_name,
            )

            if isinstance(result, dict):
                safe_result = result
            else:
                safe_result = list(result)

            output = {
                "result": safe_result
            }

        except PermissionError as error:

            output = {
                "error": f"Permission denied: {error}"
            }

        except Exception as error:

            output = {
                "error": f"Tool execution failed: {error}"
            }

        tool_outputs.append({
            "type": "function_call_output",
            "call_id": tool_call.call_id,
            "output": json.dumps(output),
        })

    final_response = client.responses.create(
        model=MODEL_NAME,
        input=(
            input_messages
            + response.output
            + tool_outputs
        ),
        tools=tools if tools else None,
    )

    response_text = final_response.output_text or (
        "I found the information, but I couldn't "
        "generate a final response."
    )

    return limit_response_words(
        response_text
    )
