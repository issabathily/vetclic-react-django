#!/usr/bin/env python
import os
import sys
import subprocess
import signal
import time
import threading

def start_django_server():
    """
    Script pour démarrer le serveur Django dans un processus séparé
    et gérer correctement son cycle de vie.
    """
    # Configuration de l'environnement Django
    current_dir = os.path.dirname(os.path.abspath(__file__))
    sys.path.insert(0, current_dir)
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'vet_clinic.settings')
    
    # Commande pour démarrer le serveur Django
    cmd = [sys.executable, "run.py"]
    
    # Démarrer le serveur
    print("Démarrage du serveur Django...")
    process = subprocess.Popen(cmd, cwd=current_dir)
    
    # Fonction pour gérer l'arrêt propre du serveur
    def handle_sigterm(signum, frame):
        print("Arrêt du serveur Django...")
        process.terminate()
        process.wait()
        sys.exit(0)
    
    # Enregistrer le gestionnaire de signaux
    signal.signal(signal.SIGTERM, handle_sigterm)
    signal.signal(signal.SIGINT, handle_sigterm)
    
    try:
        # Attendre que le serveur soit prêt
        time.sleep(2)
        print("Serveur Django démarré ! Disponible sur http://localhost:8000/")
        
        # Maintenir le script en cours d'exécution
        while True:
            if process.poll() is not None:
                print("Le serveur Django s'est arrêté de manière inattendue.")
                break
            time.sleep(1)
    except KeyboardInterrupt:
        print("Interruption détectée, arrêt du serveur Django...")
        process.terminate()
        process.wait()
    
    return 0

if __name__ == "__main__":
    sys.exit(start_django_server())