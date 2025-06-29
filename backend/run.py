#!/usr/bin/env python
import os
import sys

def main():
    """
    Script pour lancer le serveur Django.
    Permet d'exécuter le serveur Django avec les paramètres appropriés.
    """
    # Ajout du répertoire courant au PYTHONPATH
    current_dir = os.path.dirname(os.path.abspath(__file__))
    sys.path.insert(0, current_dir)
    
    # Configuration du module de paramètres Django
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'vet_clinic.settings')
    
    try:
        # Import de modules Django après la configuration de l'environnement
        import django
        django.setup()
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed?"
        ) from exc
    
    # Pour être accessible depuis l'extérieur, on utilise 0.0.0.0 comme host
    execute_from_command_line(['run.py', 'runserver', '0.0.0.0:8000'])

if __name__ == '__main__':
    main()