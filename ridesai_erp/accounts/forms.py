from django import forms
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.db import transaction

from companies.models import Company, Plan
from hr.models import Employee
from .models import User
from chat.models import Conversation, ConversationMember

class LoginForm(AuthenticationForm):
    username = forms.CharField(
        label="Email Address",
        widget=forms.EmailInput(attrs={
            "class": "form-control",
            "placeholder": "Enter your email",
            "autofocus": True,
        })
    )
    password = forms.CharField(
        label="Password",
        widget=forms.PasswordInput(attrs={
            "class": "form-control",
            "placeholder": "Enter your password",
        })
    )


class CheckStatusForm(forms.Form):
    email = forms.EmailField(
        label='Email Address',
        widget=forms.EmailInput(attrs={
            "class": "form-control",
            "placeholder": "Email used during registration",
        })
    )


class PaymentForm(forms.Form):
    """
    Step 2 — shown right after registration, on its own page. Kept
    separate from BusinessRegisterForm so the owner isn't scrolling
    through account fields, package choice, AND payment upload all in
    one long form.
    """
    payment_reference = forms.CharField(
        max_length=120, required=False, label='Payment Reference / Transaction ID',
        widget=forms.TextInput(attrs={"class": "form-control"})
    )
    payment_proof = forms.FileField(
        label='Payment Proof (screenshot / receipt)',
        widget=forms.ClearableFileInput(attrs={"class": "form-control"})
    )


class BusinessRegisterForm(UserCreationForm):

    company_name = forms.CharField(
        label="Business Name",
        widget=forms.TextInput(attrs={"class": "form-control"})
    )

    business_description = forms.CharField(
        required=False,
        widget=forms.Textarea(
            attrs={
                "class": "form-control",
                "rows": 3,
            }
        ),
    )

    business_type = forms.CharField(
        widget=forms.TextInput(attrs={"class": "form-control"})
    )

    industry = forms.CharField(
        widget=forms.TextInput(attrs={"class": "form-control"})
    )

    is_registered = forms.TypedChoiceField(
        choices=(
            (True, "Yes"),
            (False, "No"),
        ),
        coerce=lambda x: x == "True",
        widget=forms.Select(attrs={
            "class": "form-select",
        }),
    )

    registration_number = forms.CharField(
        required=False,
        widget=forms.TextInput(
            attrs={
                "class": "form-control",
            }
        ),
    )

    tax_number = forms.CharField(
        required=False,
        widget=forms.TextInput(
            attrs={
                "class": "form-control",
            }
        ),
    )

    country = forms.CharField(
        widget=forms.TextInput(
            attrs={
                "class": "form-control",
            }
        )
    )

    state = forms.CharField(
        widget=forms.TextInput(
            attrs={
                "class": "form-control",
            }
        )
    )

    city = forms.CharField(
        widget=forms.TextInput(
            attrs={
                "class": "form-control",
            }
        )
    )

    address = forms.CharField(
        widget=forms.Textarea(
            attrs={
                "class": "form-control",
                "rows": 2,
            }
        )
    )

    owner_name = forms.CharField(
        widget=forms.TextInput(
            attrs={
                "class": "form-control",
            }
        )
    )

    email = forms.EmailField(
        widget=forms.EmailInput(
            attrs={
                "class": "form-control",
            }
        )
    )

    phone = forms.CharField(
        widget=forms.TextInput(
            attrs={
                "class": "form-control",
            }
        )
    )

    cnic = forms.CharField(
        widget=forms.TextInput(
            attrs={
                "class": "form-control",
            }
        )
    )

    cnic_front = forms.ImageField(
        widget=forms.FileInput(attrs={
            "class": "form-control"
        })
    )

    cnic_back = forms.ImageField(
        widget=forms.FileInput(attrs={
            "class": "form-control"
        })
    )

    plan = forms.ModelChoiceField(
        queryset=Plan.objects.filter(is_active=True),
        empty_label=None,
        widget=forms.RadioSelect(),
    )

    class Meta:

        model = User

        fields = (
            "company_name",
            "business_description",
            "business_type",
            "industry",
            "is_registered",
            "registration_number",
            "tax_number",
            "country",
            "state",
            "city",
            "address",
            "owner_name",
            "email",
            "phone",
            "cnic",
            "cnic_front",
            "cnic_back",
            "password1",
            "password2",
        )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['password1'].widget.attrs.update({"class": "form-control"})
        self.fields['password2'].widget.attrs.update({"class": "form-control"})

    def clean_email(self):
        email = self.cleaned_data['email']
        if User.objects.filter(email=email).exists():
            raise forms.ValidationError("An account with this email already exists.")
        return email

    def clean_company_name(self):
        company_name = self.cleaned_data['company_name']
        if Company.objects.filter(name__iexact=company_name).exists():
            raise forms.ValidationError("A company with this name already exists.")
        return company_name

    @transaction.atomic
    def save(self, commit=True):

        user = super().save(commit=False)

        email = self.cleaned_data["email"]

        user.username = email
        user.email = email

        fullname = self.cleaned_data["owner_name"].split()

        user.first_name = fullname[0]

        user.last_name = " ".join(fullname[1:])

        user.phone = self.cleaned_data["phone"]

        user.role = User.ROLE_OWNER

        user.is_active = True

        if commit:
            company = Company.objects.create(

                name=self.cleaned_data["company_name"],

                description=self.cleaned_data["business_description"],

                business_type=self.cleaned_data["business_type"],

                industry=self.cleaned_data["industry"],

                is_registered=self.cleaned_data["is_registered"],

                registration_number=self.cleaned_data["registration_number"],

                tax_number=self.cleaned_data["tax_number"],

                country=self.cleaned_data["country"],

                state=self.cleaned_data["state"],

                city=self.cleaned_data["city"],

                address=self.cleaned_data["address"],

                owner_name=self.cleaned_data["owner_name"],

                email=email,

                phone=self.cleaned_data["phone"],

                cnic=self.cleaned_data["cnic"],

                cnic_front=self.cleaned_data["cnic_front"],

                cnic_back=self.cleaned_data["cnic_back"],

                plan=self.cleaned_data["plan"],

                status=Company.STATUS_PENDING,
            )

            user.company = company

            user.save()

            Employee.objects.create(

                company=company,

                user=user,

                designation="Owner",

                department="Management",

            )
            # -------------------------------
            # Default Chat Conversations
            # -------------------------------

            general = Conversation.objects.create(
                company=company,
                name="General",
                conversation_type=Conversation.GENERAL,
                created_by=user,
            )

            management = Conversation.objects.create(
                company=company,
                name="Management",
                conversation_type=Conversation.MANAGEMENT,
                created_by=user,
            )

            announcement = Conversation.objects.create(
                company=company,
                name="Announcements",
                conversation_type=Conversation.ANNOUNCEMENT,
                created_by=user,
            )

            # -------------------------------
            # Owner joins General
            # -------------------------------

            ConversationMember.objects.create(
                conversation=general,
                user=user,
                is_admin=True,
            )

            # -------------------------------
            # Owner joins Management
            # -------------------------------

            ConversationMember.objects.create(
                conversation=management,
                user=user,
                is_admin=True,
            )

            # -------------------------------
            # Owner joins Announcement
            # -------------------------------

            ConversationMember.objects.create(
                conversation=announcement,
                user=user,
                is_admin=True,
            )

        return user