# Diagrammes UML - Plateforme de Gestion des Plaintes Citoyennes (Sénégal)

## 1. Diagramme de Classes

```mermaid
classDiagram
    class User {
        +String email
        +String username
        +String first_name
        +String last_name
        +String role
        +String telephone
        +String organisation
        +String bio
        +Image avatar
        +JSON preferences
        +Boolean is_verified
        +DateTime last_activity
        +DateTime created_at
        +DateTime updated_at
        +get_full_name()
        +nombre_analyses()
        +nombre_favoris()
    }

    class Region {
        +String nom
        +String code
        +DateTime created_at
        +DateTime updated_at
    }

    class Commune {
        +String nom
        +String code_commune
        +String statut
        +Integer population
        +Float superficie
        +Float latitude
        +Float longitude
        +String maire
        +String email
        +String telephone
        +URL site_web
        +DateTime created_at
        +DateTime updated_at
        +budget_total_actuel()
        +autonomie_financiere()
    }

    class Plainte {
        +String titre
        +Text description
        +String categorie
        +String statut
        +String priorite
        +Float latitude
        +Float longitude
        +String adresse
        +DateTime date_soumission
        +DateTime date_traitement
        +DateTime date_resolution
        +Boolean anonyme
        +String reference
        +get_duree_traitement()
        +get_statut_display()
    }

    class PieceJointe {
        +String nom
        +String type_fichier
        +String url
        +Integer taille
        +DateTime uploaded_at
    }

    class Reponse {
        +Text contenu
        +String type_reponse
        +DateTime date_reponse
        +Boolean publique
        +String reference
    }

    class Notification {
        +String type
        +String titre
        +Text message
        +Boolean lu
        +DateTime date_creation
        +DateTime date_lecture
    }

    class Statistique {
        +String type
        +String periode
        +JSON donnees
        +DateTime date_generation
    }

    class UserActivity {
        +String action
        +String description
        +JSON metadata
        +String ip_address
        +Text user_agent
        +DateTime created_at
    }

    class ServicePublic {
        +String nom
        +String type_service
        +String description
        +String contact
        +String email
        +String telephone
        +Boolean actif
    }

    %% Relations
    User ||--o{ Plainte : soumet
    User ||--o{ Reponse : ecrit
    User ||--o{ Notification : reçoit
    User ||--o{ UserActivity : génère
    User }o--|| Commune : habite
    Commune }o--|| Region : appartient
    Plainte ||--o{ PieceJointe : contient
    Plainte ||--o{ Reponse : reçoit
    Plainte }o--|| Commune : concerne
    Plainte }o--|| ServicePublic : concerne
    Plainte }o--|| User : assignee
    Notification }o--|| User : destinataire
    Notification }o--|| Plainte : reference
```

## 2. Diagramme de Cas d'Utilisation

```mermaid
graph TB
    subgraph "Acteurs"
        C[Citoyen]
        A[Agent Administratif]
        M[Maire/Préfet]
        SP[Service Public]
        ONG[ONG/Acteur Développement]
        AD[Administrateur]
    end

    subgraph "Système de Gestion des Plaintes"
        UC1[Créer un compte]
        UC2[Soumettre une plainte]
        UC3[Suivre le traitement]
        UC4[Consulter l'historique]
        UC5[Recevoir notifications]
        UC6[Gérer les plaintes]
        UC7[Répondre aux plaintes]
        UC8[Générer rapports]
        UC9[Analyser statistiques]
        UC10[Gérer utilisateurs]
        UC11[Configurer système]
    end

    %% Relations Citoyen
    C --> UC1
    C --> UC2
    C --> UC3
    C --> UC4
    C --> UC5

    %% Relations Agent Administratif
    A --> UC6
    A --> UC7
    A --> UC8

    %% Relations Maire/Préfet
    M --> UC6
    M --> UC7
    M --> UC8
    M --> UC9

    %% Relations Service Public
    SP --> UC6
    SP --> UC7
    SP --> UC8

    %% Relations ONG
    ONG --> UC9

    %% Relations Administrateur
    AD --> UC10
    AD --> UC11
    AD --> UC9
```

## 3. Diagramme de Séquence - Soumission et Traitement d'une Plainte

```mermaid
sequenceDiagram
    participant C as Citoyen
    participant S as Système
    participant A as Agent
    participant SP as Service Public
    participant N as Notification

    C->>S: Se connecter
    S->>C: Authentification réussie

    C->>S: Soumettre plainte (titre, description, catégorie, localisation)
    S->>S: Valider données
    S->>S: Générer référence unique
    S->>S: Assigner à commune/service compétent
    S->>C: Confirmation soumission
    S->>N: Créer notification pour agent

    N->>A: Notifier nouvelle plainte
    A->>S: Consulter plainte
    S->>A: Afficher détails plainte

    A->>S: Changer statut (En cours)
    S->>S: Mettre à jour statut
    S->>N: Créer notification pour citoyen
    N->>C: Notifier changement statut

    A->>SP: Transférer plainte si nécessaire
    SP->>S: Traiter plainte
    S->>S: Mettre à jour statut
    S->>N: Créer notification
    N->>C: Notifier progression

    A->>S: Ajouter réponse
    S->>S: Enregistrer réponse
    S->>N: Créer notification réponse
    N->>C: Notifier nouvelle réponse

    A->>S: Marquer comme résolue
    S->>S: Finaliser plainte
    S->>N: Créer notification résolution
    N->>C: Notifier résolution
```

## 4. Diagramme d'Activité - Workflow de Gestion des Plaintes

```mermaid
flowchart TD
    A[Citoyen soumet plainte] --> B{Validation données}
    B -->|Données invalides| C[Retour erreur]
    B -->|Données valides| D[Créer plainte]
    
    D --> E[Générer référence]
    E --> F[Assigner catégorie]
    F --> G[Identifier commune/service compétent]
    
    G --> H{Type de plainte}
    H -->|Infrastructure| I[Assigner à commune]
    H -->|Service public| J[Assigner au service]
    H -->|Sécurité| K[Assigner à préfecture]
    H -->|Autre| L[Assigner par défaut]
    
    I --> M[Notifier agent responsable]
    J --> M
    K --> M
    L --> M
    
    M --> N[Agent consulte plainte]
    N --> O{Action requise}
    
    O -->|Traitement direct| P[Traiter plainte]
    O -->|Transfert nécessaire| Q[Transférer à autre service]
    O -->|Demande d'information| R[Demander compléments]
    
    P --> S[Changer statut: En cours]
    Q --> T[Notifier service destinataire]
    R --> U[Notifier citoyen]
    
    S --> V[Exécuter actions]
    T --> V
    U --> W[Attendre réponse citoyen]
    W --> V
    
    V --> X{Plainte résolue?}
    X -->|Non| Y[Continuer traitement]
    Y --> X
    X -->|Oui| Z[Marquer comme résolue]
    
    Z --> AA[Générer rapport]
    AA --> BB[Notifier citoyen]
    BB --> CC[Archiver plainte]
    CC --> DD[Fin]
```

## 5. Diagramme d'Architecture Système

```mermaid
graph TB
    subgraph "Frontend (Angular)"
        UI[Interface Utilisateur]
        COMP[Composants]
        SERV[Services]
        ROUT[Routeur]
    end

    subgraph "Backend (Django REST)"
        API[API REST]
        AUTH[Authentification JWT]
        BUS[Logique Métier]
        VAL[Validation]
    end

    subgraph "Base de Données"
        PG[PostgreSQL]
        REDIS[Redis Cache]
    end

    subgraph "Services Externes"
        SMS[SMS Gateway]
        EMAIL[Email Service]
        MAP[Cartographie]
        FILE[Stockage Fichiers]
    end

    subgraph "Monitoring"
        LOG[Logs]
        MET[Métriques]
        ALERT[Alertes]
    end

    UI --> API
    COMP --> API
    SERV --> API
    ROUT --> API

    API --> AUTH
    API --> BUS
    API --> VAL

    BUS --> PG
    BUS --> REDIS

    BUS --> SMS
    BUS --> EMAIL
    BUS --> MAP
    BUS --> FILE

    API --> LOG
    BUS --> MET
    LOG --> ALERT
    MET --> ALERT
```

## 6. Diagramme d'État - Cycle de Vie d'une Plainte

```mermaid
stateDiagram-v2
    [*] --> Nouvelle
    Nouvelle --> EnAttente : Assignation
    EnAttente --> EnCours : Prise en charge
    EnCours --> EnAttente : Suspension
    EnCours --> EnAttente : Demande d'info
    EnAttente --> EnCours : Reprise
    EnCours --> Resolue : Résolution
    EnCours --> Rejetee : Rejet
    Resolue --> [*]
    Rejetee --> [*]
    
    note right of Nouvelle
        Plainte soumise
        En attente d'assignation
    end note
    
    note right of EnAttente
        Assignée à un agent
        En attente de traitement
    end note
    
    note right of EnCours
        En cours de traitement
        Actions en cours
    end note
    
    note right of Resolue
        Problème résolu
        Plainte fermée
    end note
    
    note right of Rejetee
        Plainte rejetée
        Motif fourni
    end note
```

## 7. Diagramme de Déploiement

```mermaid
graph TB
    subgraph "Serveur Web"
        NGINX[Nginx]
        SSL[SSL Certificate]
    end

    subgraph "Application"
        GUNICORN[Gunicorn]
        DJANGO[Django App]
        CELERY[Celery Worker]
        BEAT[Celery Beat]
    end

    subgraph "Base de Données"
        POSTGRES[PostgreSQL]
        REDIS_CACHE[Redis Cache]
    end

    subgraph "Stockage"
        MEDIA[Media Files]
        STATIC[Static Files]
        BACKUP[Backups]
    end

    subgraph "Monitoring"
        PROMETHEUS[Prometheus]
        GRAFANA[Grafana]
        LOGS[ELK Stack]
    end

    NGINX --> GUNICORN
    GUNICORN --> DJANGO
    DJANGO --> POSTGRES
    DJANGO --> REDIS_CACHE
    DJANGO --> MEDIA
    DJANGO --> STATIC
    
    CELERY --> POSTGRES
    CELERY --> REDIS_CACHE
    BEAT --> POSTGRES
    
    DJANGO --> PROMETHEUS
    DJANGO --> LOGS
    PROMETHEUS --> GRAFANA
```

## 8. Diagramme de Sécurité

```mermaid
graph TB
    subgraph "Couche Présentation"
        HTTPS[HTTPS/TLS]
        CSP[Content Security Policy]
        CORS[CORS Headers]
    end

    subgraph "Authentification"
        JWT[JWT Tokens]
        REFRESH[Refresh Tokens]
        MFA[Multi-Factor Auth]
    end

    subgraph "Autorisation"
        RBAC[Role-Based Access Control]
        PERM[Permissions]
        AUDIT[Audit Trail]
    end

    subgraph "Protection Données"
        ENCRYPT[Encryption at Rest]
        HASH[Password Hashing]
        SANITIZE[Input Sanitization]
    end

    subgraph "Sécurité Réseau"
        FIREWALL[Firewall]
        WAF[Web Application Firewall]
        DDoS[DDoS Protection]
    end

    HTTPS --> JWT
    JWT --> RBAC
    RBAC --> ENCRYPT
    ENCRYPT --> FIREWALL
    
    CSP --> MFA
    MFA --> PERM
    PERM --> HASH
    HASH --> WAF
    
    CORS --> REFRESH
    REFRESH --> AUDIT
    AUDIT --> SANITIZE
    SANITIZE --> DDoS
```

## 9. Diagramme de Données - Modèle Conceptuel

```mermaid
erDiagram
    USER {
        int id PK
        string email UK
        string username UK
        string first_name
        string last_name
        string role
        string telephone
        string organisation
        text bio
        string avatar
        json preferences
        boolean is_verified
        datetime last_activity
        datetime created_at
        datetime updated_at
    }

    REGION {
        int id PK
        string nom UK
        string code UK
        datetime created_at
        datetime updated_at
    }

    COMMUNE {
        int id PK
        string nom
        string code_commune UK
        int region_id FK
        string statut
        int population
        float superficie
        float latitude
        float longitude
        string maire
        string email
        string telephone
        string site_web
        datetime created_at
        datetime updated_at
    }

    PLAINTE {
        int id PK
        string titre
        text description
        string categorie
        string statut
        string priorite
        float latitude
        float longitude
        string adresse
        int user_id FK
        int commune_id FK
        int service_public_id FK
        int assignee_id FK
        datetime date_soumission
        datetime date_traitement
        datetime date_resolution
        boolean anonyme
        string reference UK
        datetime created_at
        datetime updated_at
    }

    PIECE_JOINTE {
        int id PK
        string nom
        string type_fichier
        string url
        int taille
        int plainte_id FK
        datetime uploaded_at
    }

    REPONSE {
        int id PK
        text contenu
        string type_reponse
        int plainte_id FK
        int user_id FK
        datetime date_reponse
        boolean publique
        string reference
        datetime created_at
    }

    NOTIFICATION {
        int id PK
        string type
        string titre
        text message
        int user_id FK
        int plainte_id FK
        boolean lu
        datetime date_creation
        datetime date_lecture
    }

    SERVICE_PUBLIC {
        int id PK
        string nom
        string type_service
        text description
        string contact
        string email
        string telephone
        boolean actif
        datetime created_at
        datetime updated_at
    }

    USER ||--o{ PLAINTE : soumet
    USER ||--o{ REPONSE : ecrit
    USER ||--o{ NOTIFICATION : reçoit
    USER }o--|| COMMUNE : habite
    COMMUNE }o--|| REGION : appartient
    PLAINTE ||--o{ PIECE_JOINTE : contient
    PLAINTE ||--o{ REPONSE : reçoit
    PLAINTE }o--|| COMMUNE : concerne
    PLAINTE }o--|| SERVICE_PUBLIC : concerne
    PLAINTE }o--|| USER : assignee
    NOTIFICATION }o--|| USER : destinataire
    NOTIFICATION }o--|| PLAINTE : reference
```

## 10. Diagramme de Composants

```mermaid
graph TB
    subgraph "Module Authentification"
        AUTH_SERV[AuthService]
        JWT_SERV[JWTService]
        PERM_SERV[PermissionService]
    end

    subgraph "Module Plaintes"
        PLAINTE_SERV[PlainteService]
        CATEG_SERV[CategorieService]
        STATUT_SERV[StatutService]
    end

    subgraph "Module Géographie"
        GEO_SERV[GeographieService]
        COMMUNE_SERV[CommuneService]
        REGION_SERV[RegionService]
    end

    subgraph "Module Notifications"
        NOTIF_SERV[NotificationService]
        EMAIL_SERV[EmailService]
        SMS_SERV[SMSService]
    end

    subgraph "Module Rapports"
        RAPPORT_SERV[RapportService]
        STAT_SERV[StatistiqueService]
        EXPORT_SERV[ExportService]
    end

    subgraph "Module Fichiers"
        FILE_SERV[FileService]
        UPLOAD_SERV[UploadService]
        STORAGE_SERV[StorageService]
    end

    subgraph "Module API"
        API_GATEWAY[APIGateway]
        RATE_LIMIT[RateLimiter]
        CACHE_SERV[CacheService]
    end

    API_GATEWAY --> AUTH_SERV
    API_GATEWAY --> PLAINTE_SERV
    API_GATEWAY --> GEO_SERV
    API_GATEWAY --> NOTIF_SERV
    API_GATEWAY --> RAPPORT_SERV
    API_GATEWAY --> FILE_SERV

    PLAINTE_SERV --> CATEG_SERV
    PLAINTE_SERV --> STATUT_SERV
    PLAINTE_SERV --> GEO_SERV
    PLAINTE_SERV --> NOTIF_SERV

    NOTIF_SERV --> EMAIL_SERV
    NOTIF_SERV --> SMS_SERV

    RAPPORT_SERV --> STAT_SERV
    RAPPORT_SERV --> EXPORT_SERV

    FILE_SERV --> UPLOAD_SERV
    FILE_SERV --> STORAGE_SERV

    AUTH_SERV --> JWT_SERV
    AUTH_SERV --> PERM_SERV
```

Ces diagrammes UML fournissent une vue complète de l'architecture et du fonctionnement de la plateforme de gestion des plaintes citoyennes pour le Sénégal, couvrant tous les aspects techniques, fonctionnels et organisationnels mentionnés dans le document de conception. 
