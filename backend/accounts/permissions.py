from rest_framework import permissions

class IsAdministrator(permissions.BasePermission):
    """Permission pour l'administrateur"""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'administrator'

class IsVetOrAdmin(permissions.BasePermission):
    """Permission pour vétérinaire ou administrateur"""
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.role in ['administrator', 'veterinarian']

class IsReceptionistOrAdmin(permissions.BasePermission):
    """Permission pour réceptionniste ou administrateur"""
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.role in ['administrator', 'receptionist']
