# Generated by Django 3.0.4 on 2020-04-03 16:30

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('manager', '0003_auto_20200331_0958'),
    ]

    operations = [
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
            name='permission_task_see',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='role',
            name='permission_user_see',
            field=models.BooleanField(default=False),
        ),
    ]