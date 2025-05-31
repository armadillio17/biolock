from django import forms
from user.models import Company, Location


class CompanyForm(forms.ModelForm):
    class Meta:
        model = Company
        fields = ['name', 'location', 'ip_address']
        widgets = {
            'name': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Enter company name'
            }),
            'location': forms.Select(attrs={
                'class': 'form-control'
            }),
            'ip_address': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'e.g., 192.168.1.1 or 2001:db8::1'
            }),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['location'].queryset = Location.objects.all()
        self.fields['location'].empty_label = "Select a location"