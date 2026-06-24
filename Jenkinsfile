// Repo: https://github.com/kennykentola/kennykentola-multi-company
pipeline {
    agent {
        docker {
            image 'node:22-bookworm-slim'
        }
    }
    options {
        timeout(time: 15, unit: 'MINUTES')
    }
    stages {
        stage('Install') {
            steps {
                sh 'npm ci --no-audit --no-fund'
            }
        }
        stage('Build Shared') {
            steps {
                sh 'npm run build --workspace=packages/shared'
            }
        }
        stage('Build API') {
            steps {
                sh 'npm run build --workspace=apps/api'
            }
        }
        stage('Build Web') {
            steps {
                sh 'npm run build --workspace=apps/web'
            }
        }
    }
    post {
        failure {
            archiveArtifacts artifacts: '**/tsconfig.tsbuildinfo', allowEmptyArchive: true
        }
    }
}
