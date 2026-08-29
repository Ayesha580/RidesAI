from django import forms
from django.contrib.auth.forms import UserCreationForm

from accounts.models import User
from .models import Employee, Task

# hr/forms.py

from django import forms
from accounts.models import User
from hr.models import Employee
from django import forms
from .models import Employee

class HRCreateForm(forms.ModelForm):
    password = forms.CharField(widget=forms.PasswordInput)

    designation = forms.CharField(required=False)
    age = forms.IntegerField(required=False)
    department = forms.CharField(required=False)

    class Meta:
        model = User
        fields = [
            "first_name",
            "last_name",
            "username",
            "email",
            "password",
        ]

    def save(self, company):
        print("COMPANY:", company)
        print("COMPANY ID:", company.id if company else None)

        user = super().save(commit=False)

        user.company = company
        user.role = User.ROLE_HR
        user.set_password(self.cleaned_data["password"])
        user.save()

        print("USER COMPANY:", user.company)

        Employee.objects.create(
            company=company,
            user=user,
            designation=self.cleaned_data.get("designation", ""),
        )

        return user

class EmployeeCreateForm(forms.Form):
    first_name = forms.CharField(max_length=150)
    last_name = forms.CharField(max_length=150)
    username = forms.CharField(max_length=150)
    email = forms.EmailField()
    password = forms.CharField(widget=forms.PasswordInput)
    designation = forms.CharField(max_length=100, required=False)
    age = forms.IntegerField(required=False, min_value=18, max_value=100)

    def clean_username(self):
        username = self.cleaned_data["username"]
        if User.objects.filter(username=username).exists():
            raise forms.ValidationError("This username is already taken.")
        return username

    def clean_email(self):
        email = self.cleaned_data["email"]
        if User.objects.filter(email=email).exists():
            raise forms.ValidationError("This email is already registered.")
        return email

    def save(self, company):
        user = User.objects.create_user(
            username=self.cleaned_data["username"],
            email=self.cleaned_data["email"],
            password=self.cleaned_data["password"],
            first_name=self.cleaned_data["first_name"],
            last_name=self.cleaned_data["last_name"],
            role=User.ROLE_EMPLOYEE,
            company=company,
        )

        Employee.objects.create(
            user=user,
            company=company,
            designation=self.cleaned_data.get("designation", ""),
            age=self.cleaned_data.get("age"),
            department=self.cleaned_data.get("department", ""),
        )

        return user



class TaskForm(forms.ModelForm):
    class Meta:
        model = Task
        fields = ['title', 'description', 'assigned_to', 'priority', 'status', 'due_date']

    def __init__(self, *args, company=None, **kwargs):
        super().__init__(*args, **kwargs)
        if company is not None:
            self.fields['assigned_to'].queryset = User.objects.filter(company=company)