#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Template Flask App - meskeIA
Aplicación Flask con estándares meskeIA
"""

import os
from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import locale

# Configurar localización española
try:
    locale.setlocale(locale.LC_ALL, 'es_ES.UTF-8')
except:
    try:
        locale.setlocale(locale.LC_ALL, 'Spanish_Spain.1252')  # Windows
    except:
        pass

# Cargar variables de entorno
load_dotenv()

app = Flask(__name__)
CORS(app)

# Configuración
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-key-change-in-production')
app.config['DEBUG'] = os.getenv('DEBUG', 'True') == 'True'

# API Keys (NUNCA hardcodear)
API_KEY = os.getenv('API_KEY')
if not API_KEY:
    print("⚠️ WARNING: API_KEY no configurada en .env")

@app.route('/')
def index():
    """Página principal"""
    return render_template('index.html')

@app.route('/api/ejemplo', methods=['GET', 'POST'])
def api_ejemplo():
    """Endpoint de ejemplo"""
    if request.method == 'POST':
        datos = request.get_json()
        # Procesar datos aquí
        return jsonify({
            'status': 'success',
            'mensaje': 'Datos procesados correctamente',
            'datos': datos
        })

    return jsonify({
        'status': 'success',
        'mensaje': 'API funcionando correctamente'
    })

@app.errorhandler(404)
def not_found(error):
    """Manejo de errores 404"""
    return jsonify({
        'status': 'error',
        'mensaje': 'Recurso no encontrado'
    }), 404

@app.errorhandler(500)
def internal_error(error):
    """Manejo de errores 500"""
    return jsonify({
        'status': 'error',
        'mensaje': 'Error interno del servidor'
    }), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=app.config['DEBUG'])
