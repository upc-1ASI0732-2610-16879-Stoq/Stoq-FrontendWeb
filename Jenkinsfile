pipeline {
    agent any

    tools {
        nodejs 'node-20'
    }

    environment {
        GITHUB_CREDENTIALS_ID = 'github-credentials'
        // Inyectamos de forma segura la credencial de Netlify
        NETLIFY_FRONT_WEBHOOK = credentials('netlify-frontend-webhook')
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                echo 'Instalando paquetes de Node para Angular (npm ci)...'
                sh 'npm ci'
            }
        }

        stage('Build & Lint Angular App') {
            steps {
                echo 'Compilando el proyecto Angular con TypeScript...'
                sh 'npm run build'
            }
        }

        stage('Deploy to Netlify') {
            steps {
                echo '¡CI aprobado con éxito! Notificando a Netlify para iniciar el despliegue...'
                // Disparamos Netlify
                sh "curl -X POST '${NETLIFY_FRONT_WEBHOOK}'"
            }
        }
    }

    post {
        success {
            echo '¡Pipeline del Frontend ejecutado por completo con éxito en Netlify!'
        }
        failure {
            echo 'Algo falló en el pipeline del Front. Revisa los logs.'
        }
    }
}
