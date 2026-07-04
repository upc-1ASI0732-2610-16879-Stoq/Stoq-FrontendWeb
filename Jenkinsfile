pipeline {
    agent any

    tools {
        // Usamos el entorno Node 20 que configuramos
        nodejs 'node-20'
    }

    environment {
        GITHUB_CREDENTIALS_ID = 'github-credentials'
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
                // Instala los paquetes basándose estrictamente en tu package-lock.json
                sh 'npm ci'
            }
        }

        stage('Build & Lint Angular App') {
            steps {
                echo 'Compilando el proyecto Angular con TypeScript para verificar errores...'
                // Corre la compilación local
                sh 'npm run build'
            }
        }
    }

    post {
        success {
            echo '¡CI del Frontend verificado con éxito! El código compila perfectamente.'
        }
        failure {
            echo 'Algo falló en la compilación de Angular. Revisa los logs de TypeScript.'
        }
    }
}
