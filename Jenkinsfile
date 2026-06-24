// Repo: https://github.com/kennykentola/kennykentola-multi-company
pipeline {
    agent {
        docker {
            image 'node:22-bookworm-slim'
        }
    }
    options {
        timeout(time: 30, unit: 'MINUTES')
    }
    stages {
        stage('Install') {
            steps {
                sh 'npm ci --no-audit --no-fund'
            }
        }
        stage('Type Check Shared') {
            steps {
                sh 'npm run typecheck --workspace=packages/shared'
            }
        }
        stage('Type Check API') {
            steps {
                sh 'npm run typecheck --workspace=apps/api'
            }
        }
        stage('Type Check Web') {
            steps {
                sh 'npm run typecheck --workspace=apps/web'
            }
        }
        stage('Test Shared') {
            steps {
                dir('packages/shared') {
                    sh 'npx vitest run'
                }
            }
        }
        stage('Test API') {
            steps {
                dir('apps/api') {
                    sh 'npx vitest run'
                }
            }
        }
        stage('Test Web') {
            steps {
                dir('apps/web') {
                    sh 'npx vitest run'
                }
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
