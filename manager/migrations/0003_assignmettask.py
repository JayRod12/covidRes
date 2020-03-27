# Generated by Django 3.0.4 on 2020-03-27 12:19

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('manager', '0002_role_user'),
    ]

    operations = [
        migrations.CreateModel(
            name='AssignmetTask',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('bool_install', models.BooleanField(choices=[(True, 'Install'), (True, 'Remove')], default=False, verbose_name='installed')),
                ('machine', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='machine_assignments', to='manager.Machine')),
                ('patient', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='machine_assignments', to='manager.Patient')),
            ],
        ),
    ]