from django.db import models
from django.conf import settings
from patients.models import Patient

class Appointment(models.Model):
    """Modèle représentant un rendez-vous vétérinaire"""
    
    STATUS_CHOICES = [
        ('scheduled', 'Planifié'),
        ('completed', 'Terminé'),
        ('cancelled', 'Annulé'),
        ('no_show', 'Non présenté'),
    ]
    
    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name='appointments',
        verbose_name='Patient'
    )
    
    vet = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='appointments',
        verbose_name='Vétérinaire',
        limit_choices_to={'role': 'veterinarian'}
    )
    
    date_time = models.DateTimeField('Date et heure du rendez-vous')
    reason = models.TextField('Raison de la visite', blank=True)
    status = models.CharField(
        'Statut',
        max_length=20,
        choices=STATUS_CHOICES,
        default='scheduled'
    )
    notes = models.TextField('Notes du vétérinaire', blank=True)
    created_at = models.DateTimeField('Date de création', auto_now_add=True)
    updated_at = models.DateTimeField('Dernière mise à jour', auto_now=True)

    class Meta:
        ordering = ['date_time']
        verbose_name = 'Rendez-vous'
        verbose_name_plural = 'Rendez-vous'
        permissions = [
            ('view_all_appointments', 'Peut voir tous les rendez-vous'),
            ('cancel_appointment', 'Peut annuler un rendez-vous'),
        ]

    def __str__(self):
        return f"{self.patient.name} - {self.date_time.strftime('%d/%m/%Y %H:%M')} - {self.get_status_display()}"
    
    @property
    def is_past_due(self):
        from django.utils import timezone
        return self.date_time < timezone.now()
    
    @property
    def duration(self):
        # Durée par défaut d'un rendez-vous en minutes
        return 30
from django.db import models
from django.conf import settings
from patients.models import Patient

class Appointment(models.Model):
    """Modèle représentant un rendez-vous vétérinaire"""
    
    STATUS_CHOICES = [
        ('scheduled', 'Planifié'),
        ('completed', 'Terminé'),
        ('cancelled', 'Annulé'),
        ('no_show', 'Non présenté'),
    ]
    
    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name='appointments',
        verbose_name='Patient'
    )
    
    vet = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='appointments',
        verbose_name='Vétérinaire',
        limit_choices_to={'role': 'veterinarian'}
    )
    
    date_time = models.DateTimeField('Date et heure du rendez-vous')
    reason = models.TextField('Raison de la visite', blank=True)
    status = models.CharField(
        'Statut',
        max_length=20,
        choices=STATUS_CHOICES,
        default='scheduled'
    )
    notes = models.TextField('Notes du vétérinaire', blank=True)
    created_at = models.DateTimeField('Date de création', auto_now_add=True)
    updated_at = models.DateTimeField('Dernière mise à jour', auto_now=True)

    class Meta:
        ordering = ['date_time']
        verbose_name = 'Rendez-vous'
        verbose_name_plural = 'Rendez-vous'
        permissions = [
            ('view_all_appointments', 'Peut voir tous les rendez-vous'),
            ('cancel_appointment', 'Peut annuler un rendez-vous'),
        ]

    def __str__(self):
        return f"{self.patient.name} - {self.date_time.strftime('%d/%m/%Y %H:%M')} - {self.get_status_display()}"
    
    @property
    def is_past_due(self):
        from django.utils import timezone
        return self.date_time < timezone.now()
    
    @property
    def duration(self):
        # Durée par défaut d'un rendez-vous en minutes
        return 30
from django.db import models
from django.conf import settings
from patients.models import Patient

class Appointment(models.Model):
    """Modèle représentant un rendez-vous vétérinaire"""
    
    STATUS_CHOICES = [
        ('scheduled', 'Planifié'),
        ('completed', 'Terminé'),
        ('cancelled', 'Annulé'),
        ('no_show', 'Non présenté'),
    ]
    
    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name='appointments',
        verbose_name='Patient'
    )
    
    vet = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='appointments',
        verbose_name='Vétérinaire',
        limit_choices_to={'role': 'veterinarian'}
    )
    
    date_time = models.DateTimeField('Date et heure du rendez-vous')
    reason = models.TextField('Raison de la visite', blank=True)
    status = models.CharField(
        'Statut',
        max_length=20,
        choices=STATUS_CHOICES,
        default='scheduled'
    )
    notes = models.TextField('Notes du vétérinaire', blank=True)
    created_at = models.DateTimeField('Date de création', auto_now_add=True)
    updated_at = models.DateTimeField('Dernière mise à jour', auto_now=True)

    class Meta:
        ordering = ['date_time']
        verbose_name = 'Rendez-vous'
        verbose_name_plural = 'Rendez-vous'
        permissions = [
            ('view_all_appointments', 'Peut voir tous les rendez-vous'),
            ('cancel_appointment', 'Peut annuler un rendez-vous'),
        ]

    def __str__(self):
        return f"{self.patient.name} - {self.date_time.strftime('%d/%m/%Y %H:%M')} - {self.get_status_display()}"
    
    @property
    def is_past_due(self):
        from django.utils import timezone
        return self.date_time < timezone.now()
    
    @property
    def duration(self):
        # Durée par défaut d'un rendez-vous en minutes
        return 30
from django.db import models
from django.conf import settings
from patients.models import Patient

class Appointment(models.Model):
    """Modèle représentant un rendez-vous vétérinaire"""
    
    STATUS_CHOICES = [
        ('scheduled', 'Planifié'),
        ('completed', 'Terminé'),
        ('cancelled', 'Annulé'),
        ('no_show', 'Non présenté'),
    ]
    
    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name='appointments',
        verbose_name='Patient'
    )
    
    vet = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='appointments',
        verbose_name='Vétérinaire',
        limit_choices_to={'role': 'veterinarian'}
    )
    
    date_time = models.DateTimeField('Date et heure du rendez-vous')
    reason = models.TextField('Raison de la visite', blank=True)
    status = models.CharField(
        'Statut',
        max_length=20,
        choices=STATUS_CHOICES,
        default='scheduled'
    )
    notes = models.TextField('Notes du vétérinaire', blank=True)
    created_at = models.DateTimeField('Date de création', auto_now_add=True)
    updated_at = models.DateTimeField('Dernière mise à jour', auto_now=True)

    class Meta:
        ordering = ['date_time']
        verbose_name = 'Rendez-vous'
        verbose_name_plural = 'Rendez-vous'
        permissions = [
            ('view_all_appointments', 'Peut voir tous les rendez-vous'),
            ('cancel_appointment', 'Peut annuler un rendez-vous'),
        ]

    def __str__(self):
        return f"{self.patient.name} - {self.date_time.strftime('%d/%m/%Y %H:%M')} - {self.get_status_display()}"
    
    @property
    def is_past_due(self):
        from django.utils import timezone
        return self.date_time < timezone.now()
    
    @property
    def duration(self):
        # Durée par défaut d'un rendez-vous en minutes
        return 30
from django.db import models
from django.conf import settings
from patients.models import Patient

class Appointment(models.Model):
    """Modèle représentant un rendez-vous vétérinaire"""
    
    STATUS_CHOICES = [
        ('scheduled', 'Planifié'),
        ('completed', 'Terminé'),
        ('cancelled', 'Annulé'),
        ('no_show', 'Non présenté'),
    ]
    
    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name='appointments',
        verbose_name='Patient'
    )
    
    vet = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='appointments',
        verbose_name='Vétérinaire',
        limit_choices_to={'role': 'veterinarian'}
    )
    
    date_time = models.DateTimeField('Date et heure du rendez-vous')
    reason = models.TextField('Raison de la visite', blank=True)
    status = models.CharField(
        'Statut',
        max_length=20,
        choices=STATUS_CHOICES,
        default='scheduled'
    )
    notes = models.TextField('Notes du vétérinaire', blank=True)
    created_at = models.DateTimeField('Date de création', auto_now_add=True)
    updated_at = models.DateTimeField('Dernière mise à jour', auto_now=True)

    class Meta:
        ordering = ['date_time']
        verbose_name = 'Rendez-vous'
        verbose_name_plural = 'Rendez-vous'
        permissions = [
            ('view_all_appointments', 'Peut voir tous les rendez-vous'),
            ('cancel_appointment', 'Peut annuler un rendez-vous'),
        ]

    def __str__(self):
        return f"{self.patient.name} - {self.date_time.strftime('%d/%m/%Y %H:%M')} - {self.get_status_display()}"
    
    @property
    def is_past_due(self):
        from django.utils import timezone
        return self.date_time < timezone.now()
    
    @property
    def duration(self):
        # Durée par défaut d'un rendez-vous en minutes
        return 30
from django.db import models
from django.conf import settings
from patients.models import Patient

class Appointment(models.Model):
    """Modèle représentant un rendez-vous vétérinaire"""
    
    STATUS_CHOICES = [
        ('scheduled', 'Planifié'),
        ('completed', 'Terminé'),
        ('cancelled', 'Annulé'),
        ('no_show', 'Non présenté'),
    ]
    
    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name='appointments',
        verbose_name='Patient'
    )
    
    vet = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='appointments',
        verbose_name='Vétérinaire',
        limit_choices_to={'role': 'veterinarian'}
    )
    
    date_time = models.DateTimeField('Date et heure du rendez-vous')
    reason = models.TextField('Raison de la visite', blank=True)
    status = models.CharField(
        'Statut',
        max_length=20,
        choices=STATUS_CHOICES,
        default='scheduled'
    )
    notes = models.TextField('Notes du vétérinaire', blank=True)
    created_at = models.DateTimeField('Date de création', auto_now_add=True)
    updated_at = models.DateTimeField('Dernière mise à jour', auto_now=True)

    class Meta:
        ordering = ['date_time']
        verbose_name = 'Rendez-vous'
        verbose_name_plural = 'Rendez-vous'
        permissions = [
            ('view_all_appointments', 'Peut voir tous les rendez-vous'),
            ('cancel_appointment', 'Peut annuler un rendez-vous'),
        ]

    def __str__(self):
        return f"{self.patient.name} - {self.date_time.strftime('%d/%m/%Y %H:%M')} - {self.get_status_display()}"
    
    @property
    def is_past_due(self):
        from django.utils import timezone
        return self.date_time < timezone.now()
    
    @property
    def duration(self):
        # Durée par défaut d'un rendez-vous en minutes
        return 30
from django.db import models
from django.conf import settings
from patients.models import Patient

class Appointment(models.Model):
    """Modèle représentant un rendez-vous vétérinaire"""
    
    STATUS_CHOICES = [
        ('scheduled', 'Planifié'),
        ('completed', 'Terminé'),
        ('cancelled', 'Annulé'),
        ('no_show', 'Non présenté'),
    ]
    
    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name='appointments',
        verbose_name='Patient'
    )
    
    vet = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='appointments',
        verbose_name='Vétérinaire',
        limit_choices_to={'role': 'veterinarian'}
    )
    
    date_time = models.DateTimeField('Date et heure du rendez-vous')
    reason = models.TextField('Raison de la visite', blank=True)
    status = models.CharField(
        'Statut',
        max_length=20,
        choices=STATUS_CHOICES,
        default='scheduled'
    )
    notes = models.TextField('Notes du vétérinaire', blank=True)
    created_at = models.DateTimeField('Date de création', auto_now_add=True)
    updated_at = models.DateTimeField('Dernière mise à jour', auto_now=True)

    class Meta:
        ordering = ['date_time']
        verbose_name = 'Rendez-vous'
        verbose_name_plural = 'Rendez-vous'
        permissions = [
            ('view_all_appointments', 'Peut voir tous les rendez-vous'),
            ('cancel_appointment', 'Peut annuler un rendez-vous'),
        ]

    def __str__(self):
        return f"{self.patient.name} - {self.date_time.strftime('%d/%m/%Y %H:%M')} - {self.get_status_display()}"
    
    @property
    def is_past_due(self):
        from django.utils import timezone
        return self.date_time < timezone.now()
    
    @property
    def duration(self):
        # Durée par défaut d'un rendez-vous en minutes
        return 30
from django.db import models
from django.conf import settings
from patients.models import Patient

class Appointment(models.Model):
    """Modèle représentant un rendez-vous vétérinaire"""
    
    STATUS_CHOICES = [
        ('scheduled', 'Planifié'),
        ('completed', 'Terminé'),
        ('cancelled', 'Annulé'),
        ('no_show', 'Non présenté'),
    ]
    
    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name='appointments',
        verbose_name='Patient'
    )
    
    vet = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='appointments',
        verbose_name='Vétérinaire',
        limit_choices_to={'role': 'veterinarian'}
    )
    
    date_time = models.DateTimeField('Date et heure du rendez-vous')
    reason = models.TextField('Raison de la visite', blank=True)
    status = models.CharField(
        'Statut',
        max_length=20,
        choices=STATUS_CHOICES,
        default='scheduled'
    )
    notes = models.TextField('Notes du vétérinaire', blank=True)
    created_at = models.DateTimeField('Date de création', auto_now_add=True)
    updated_at = models.DateTimeField('Dernière mise à jour', auto_now=True)

    class Meta:
        ordering = ['date_time']
        verbose_name = 'Rendez-vous'
        verbose_name_plural = 'Rendez-vous'
        permissions = [
            ('view_all_appointments', 'Peut voir tous les rendez-vous'),
            ('cancel_appointment', 'Peut annuler un rendez-vous'),
        ]

    def __str__(self):
        return f"{self.patient.name} - {self.date_time.strftime('%d/%m/%Y %H:%M')} - {self.get_status_display()}"
    
    @property
    def is_past_due(self):
        from django.utils import timezone
        return self.date_time < timezone.now()
    
    @property
    def duration(self):
        # Durée par défaut d'un rendez-vous en minutes
        return 30
from django.db import models
from django.conf import settings
from patients.models import Patient

class Appointment(models.Model):
    """Modèle représentant un rendez-vous vétérinaire"""
    
    STATUS_CHOICES = [
        ('scheduled', 'Planifié'),
        ('completed', 'Terminé'),
        ('cancelled', 'Annulé'),
        ('no_show', 'Non présenté'),
    ]
    
    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name='appointments',
        verbose_name='Patient'
    )
    
    vet = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='appointments',
        verbose_name='Vétérinaire',
        limit_choices_to={'role': 'veterinarian'}
    )
    
    date_time = models.DateTimeField('Date et heure du rendez-vous')
    reason = models.TextField('Raison de la visite', blank=True)
    status = models.CharField(
        'Statut',
        max_length=20,
        choices=STATUS_CHOICES,
        default='scheduled'
    )
    notes = models.TextField('Notes du vétérinaire', blank=True)
    created_at = models.DateTimeField('Date de création', auto_now_add=True)
    updated_at = models.DateTimeField('Dernière mise à jour', auto_now=True)

    class Meta:
        ordering = ['date_time']
        verbose_name = 'Rendez-vous'
        verbose_name_plural = 'Rendez-vous'
        permissions = [
            ('view_all_appointments', 'Peut voir tous les rendez-vous'),
            ('cancel_appointment', 'Peut annuler un rendez-vous'),
        ]

    def __str__(self):
        return f"{self.patient.name} - {self.date_time.strftime('%d/%m/%Y %H:%M')} - {self.get_status_display()}"
    
    @property
    def is_past_due(self):
        from django.utils import timezone
        return self.date_time < timezone.now()
    
    @property
    def duration(self):
        # Durée par défaut d'un rendez-vous en minutes
        return 30
from django.db import models
from django.conf import settings
from patients.models import Patient

class Appointment(models.Model):
    """Modèle représentant un rendez-vous vétérinaire"""
    
    STATUS_CHOICES = [
        ('scheduled', 'Planifié'),
        ('completed', 'Terminé'),
        ('cancelled', 'Annulé'),
        ('no_show', 'Non présenté'),
    ]
    
    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name='appointments',
        verbose_name='Patient'
    )
    
    vet = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='appointments',
        verbose_name='Vétérinaire',
        limit_choices_to={'role': 'veterinarian'}
    )
    
    date_time = models.DateTimeField('Date et heure du rendez-vous')
    reason = models.TextField('Raison de la visite', blank=True)
    status = models.CharField(
        'Statut',
        max_length=20,
        choices=STATUS_CHOICES,
        default='scheduled'
    )
    notes = models.TextField('Notes du vétérinaire', blank=True)
    created_at = models.DateTimeField('Date de création', auto_now_add=True)
    updated_at = models.DateTimeField('Dernière mise à jour', auto_now=True)

    class Meta:
        ordering = ['date_time']
        verbose_name = 'Rendez-vous'
        verbose_name_plural = 'Rendez-vous'
        permissions = [
            ('view_all_appointments', 'Peut voir tous les rendez-vous'),
            ('cancel_appointment', 'Peut annuler un rendez-vous'),
        ]

    def __str__(self):
        return f"{self.patient.name} - {self.date_time.strftime('%d/%m/%Y %H:%M')} - {self.get_status_display()}"
    
    @property
    def is_past_due(self):
        from django.utils import timezone
        return self.date_time < timezone.now()
    
    @property
    def duration(self):
        # Durée par défaut d'un rendez-vous en minutes
        return 30
from django.db import models
from django.conf import settings
from patients.models import Patient

class Appointment(models.Model):
    """Modèle représentant un rendez-vous vétérinaire"""
    
    STATUS_CHOICES = [
        ('scheduled', 'Planifié'),
        ('completed', 'Terminé'),
        ('cancelled', 'Annulé'),
        ('no_show', 'Non présenté'),
    ]
    
    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name='appointments',
        verbose_name='Patient'
    )
    
    vet = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='appointments',
        verbose_name='Vétérinaire',
        limit_choices_to={'role': 'veterinarian'}
    )
    
    date_time = models.DateTimeField('Date et heure du rendez-vous')
    reason = models.TextField('Raison de la visite', blank=True)
    status = models.CharField(
        'Statut',
        max_length=20,
        choices=STATUS_CHOICES,
        default='scheduled'
    )
    notes = models.TextField('Notes du vétérinaire', blank=True)
    created_at = models.DateTimeField('Date de création', auto_now_add=True)
    updated_at = models.DateTimeField('Dernière mise à jour', auto_now=True)

    class Meta:
        ordering = ['date_time']
        verbose_name = 'Rendez-vous'
        verbose_name_plural = 'Rendez-vous'
        permissions = [
            ('view_all_appointments', 'Peut voir tous les rendez-vous'),
            ('cancel_appointment', 'Peut annuler un rendez-vous'),
        ]

    def __str__(self):
        return f"{self.patient.name} - {self.date_time.strftime('%d/%m/%Y %H:%M')} - {self.get_status_display()}"
    
    @property
    def is_past_due(self):
        from django.utils import timezone
        return self.date_time < timezone.now()
    
    @property
    def duration(self):
        # Durée par défaut d'un rendez-vous en minutes
        return 30
from django.db import models
from django.conf import settings
from patients.models import Patient

class Appointment(models.Model):
    """Modèle représentant un rendez-vous vétérinaire"""
    
    STATUS_CHOICES = [
        ('scheduled', 'Planifié'),
        ('completed', 'Terminé'),
        ('cancelled', 'Annulé'),
        ('no_show', 'Non présenté'),
    ]
    
    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name='appointments',
        verbose_name='Patient'
    )
    
    vet = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='appointments',
        verbose_name='Vétérinaire',
        limit_choices_to={'role': 'veterinarian'}
    )
    
    date_time = models.DateTimeField('Date et heure du rendez-vous')
    reason = models.TextField('Raison de la visite', blank=True)
    status = models.CharField(
        'Statut',
        max_length=20,
        choices=STATUS_CHOICES,
        default='scheduled'
    )
    notes = models.TextField('Notes du vétérinaire', blank=True)
    created_at = models.DateTimeField('Date de création', auto_now_add=True)
    updated_at = models.DateTimeField('Dernière mise à jour', auto_now=True)

    class Meta:
        ordering = ['date_time']
        verbose_name = 'Rendez-vous'
        verbose_name_plural = 'Rendez-vous'
        permissions = [
            ('view_all_appointments', 'Peut voir tous les rendez-vous'),
            ('cancel_appointment', 'Peut annuler un rendez-vous'),
        ]

    def __str__(self):
        return f"{self.patient.name} - {self.date_time.strftime('%d/%m/%Y %H:%M')} - {self.get_status_display()}"
    
    @property
    def is_past_due(self):
        from django.utils import timezone
        return self.date_time < timezone.now()
    
    @property
    def duration(self):
        # Durée par défaut d'un rendez-vous en minutes
        return 30
from django.db import models
from django.conf import settings
from patients.models import Patient

class Appointment(models.Model):
    """Modèle représentant un rendez-vous vétérinaire"""
    
    STATUS_CHOICES = [
        ('scheduled', 'Planifié'),
        ('completed', 'Terminé'),
        ('cancelled', 'Annulé'),
        ('no_show', 'Non présenté'),
    ]
    
    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name='appointments',
        verbose_name='Patient'
    )
    
    vet = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='appointments',
        verbose_name='Vétérinaire',
        limit_choices_to={'role': 'veterinarian'}
    )
    
    date_time = models.DateTimeField('Date et heure du rendez-vous')
    reason = models.TextField('Raison de la visite', blank=True)
    status = models.CharField(
        'Statut',
        max_length=20,
        choices=STATUS_CHOICES,
        default='scheduled'
    )
    notes = models.TextField('Notes du vétérinaire', blank=True)
    created_at = models.DateTimeField('Date de création', auto_now_add=True)
    updated_at = models.DateTimeField('Dernière mise à jour', auto_now=True)

    class Meta:
        ordering = ['date_time']
        verbose_name = 'Rendez-vous'
        verbose_name_plural = 'Rendez-vous'
        permissions = [
            ('view_all_appointments', 'Peut voir tous les rendez-vous'),
            ('cancel_appointment', 'Peut annuler un rendez-vous'),
        ]

    def __str__(self):
        return f"{self.patient.name} - {self.date_time.strftime('%d/%m/%Y %H:%M')} - {self.get_status_display()}"
    
    @property
    def is_past_due(self):
        from django.utils import timezone
        return self.date_time < timezone.now()
    
    @property
    def duration(self):
        # Durée par défaut d'un rendez-vous en minutes
        return 30
from django.db import models
from django.conf import settings
from patients.models import Patient

class Appointment(models.Model):
    """Modèle représentant un rendez-vous vétérinaire"""
    
    STATUS_CHOICES = [
        ('scheduled', 'Planifié'),
        ('completed', 'Terminé'),
        ('cancelled', 'Annulé'),
        ('no_show', 'Non présenté'),
    ]
    
    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name='appointments',
        verbose_name='Patient'
    )
    
    vet = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='appointments',
        verbose_name='Vétérinaire',
        limit_choices_to={'role': 'veterinarian'}
    )
    
    date_time = models.DateTimeField('Date et heure du rendez-vous')
    reason = models.TextField('Raison de la visite', blank=True)
    status = models.CharField(
        'Statut',
        max_length=20,
        choices=STATUS_CHOICES,
        default='scheduled'
    )
    notes = models.TextField('Notes du vétérinaire', blank=True)
    created_at = models.DateTimeField('Date de création', auto_now_add=True)
    updated_at = models.DateTimeField('Dernière mise à jour', auto_now=True)

    class Meta:
        ordering = ['date_time']
        verbose_name = 'Rendez-vous'
        verbose_name_plural = 'Rendez-vous'
        permissions = [
            ('view_all_appointments', 'Peut voir tous les rendez-vous'),
            ('cancel_appointment', 'Peut annuler un rendez-vous'),
        ]

    def __str__(self):
        return f"{self.patient.name} - {self.date_time.strftime('%d/%m/%Y %H:%M')} - {self.get_status_display()}"
    
    @property
    def is_past_due(self):
        from django.utils import timezone
        return self.date_time < timezone.now()
    
    @property
    def duration(self):
        # Durée par défaut d'un rendez-vous en minutes
        return 30
