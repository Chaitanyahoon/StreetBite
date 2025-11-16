#!/usr/bin/env pwsh

# Maven wrapper script
$mavenBin = "$env:USERPROFILE\AppData\Local\Maven\apache-maven-3.9.6\bin"
$env:M2_HOME = "$env:USERPROFILE\AppData\Local\Maven\apache-maven-3.9.6"

# Execute Maven with all passed arguments
& cmd /c "$mavenBin\mvn.cmd" @args
