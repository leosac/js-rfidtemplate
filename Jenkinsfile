pipeline {
    agent any
	stages {
	    stage('Build') {
            steps {
                nodejs(nodeJSInstallationName: 'node20') {
                    sh 'npm ci'
					sh 'npm run build --if-present'
                }
            }
        }
        stage('Sonar') {
            environment {
                scannerHome = tool 'SonarQube Scanner default'
            }
            steps {
                withSonarQubeEnv('SonarQube Community') {
                    sh "dotnet ${scannerHome}/bin/sonar-scanner -Dsonar.projectKey=leosac_js-rfidtemplate_d57d7505-7f34-4398-b069-4e675859e06f"
                }
                timeout(time: 1, unit: 'HOURS') {
                    waitForQualityGate(abortPipeline: true)
                }
            }
            when {
                anyOf {
                    branch 'main'
                    buildingTag()
                    changeRequest()
                }
            }
        }
    }
}