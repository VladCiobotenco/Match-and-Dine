from django.db import migrations, models
from django.contrib.auth.hashers import make_password


def create_admin_user(apps, schema_editor):
    User = apps.get_model('auth', 'User')
    UserProfile = apps.get_model('backend', 'UserProfile')

    admin_email = 'admin@matchanddine.local'
    admin_username = admin_email
    admin_password = 'Admin123!'

    admin, created = User.objects.get_or_create(
        username=admin_username,
        defaults={
            'email': admin_email,
            'first_name': 'Admin',
            'last_name': 'Match & Dine',
            'is_staff': True,
            'is_superuser': True,
            'is_active': True,
        }
    )
    if created:
        # Use make_password to set the hashed password in migration context
        admin.password = make_password(admin_password)
        admin.save()
    else:
        admin.is_staff = True
        admin.is_superuser = True
        admin.save()

    profile, profile_created = UserProfile.objects.get_or_create(
        user=admin,
        defaults={
            'nume': 'Admin',
            'prenume': 'Match & Dine',
            'email': admin_email,
            'telefon': '',
            'is_admin': True,
        }
    )
    if not profile.is_admin:
        profile.is_admin = True
        profile.save()


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0006_restaurant_is_approved'),
    ]

    operations = [
        migrations.AddField(
            model_name='userprofile',
            name='is_admin',
            field=models.BooleanField(default=False),
        ),
        migrations.RunPython(create_admin_user),
    ]
