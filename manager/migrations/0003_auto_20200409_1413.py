# Generated by Django 3.0.4 on 2020-04-09 12:13

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('manager', '0002_patient_default_pass'),
    ]

    operations = [
        migrations.CreateModel(
            name='Location',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('description', models.TextField(blank=True)),
            ],
        ),
        migrations.AddField(
            model_name='role',
            name='permission_location_edit',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='role',
            name='permission_location_see',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='role',
            name='permission_machine_see',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='role',
            name='permission_machinetype_see',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='role',
            name='permission_message_see',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='role',
            name='permission_patient_edit',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='role',
            name='permission_patient_see',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='role',
            name='permission_role_edit',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='role',
            name='permission_role_see',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='role',
            name='permission_task_see',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='role',
            name='permission_user_see',
            field=models.BooleanField(default=False),
        ),
        migrations.AlterField(
            model_name='machine',
            name='location',
            field=models.ForeignKey(default=None, null=True, on_delete=django.db.models.deletion.SET_NULL, to='manager.Location'),
        ),
        migrations.AlterField(
            model_name='patient',
            name='location',
            field=models.ForeignKey(default=None, null=True, on_delete=django.db.models.deletion.SET_NULL, to='manager.Location'),
        ),
    ]