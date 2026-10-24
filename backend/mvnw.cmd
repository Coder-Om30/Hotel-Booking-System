@REM ----------------------------------------------------------------------------
@REM Maven Wrapper Script for Hotel Booking System
@REM ----------------------------------------------------------------------------

@IF "%DEBUG%" == "1" @ECHO ON
@SETLOCAL

@REM 1. Check if global mvn exists
@where mvn >nul 2>nul
@IF %ERRORLEVEL% EQU 0 (
    @mvn %*
    @EXIT /B %ERRORLEVEL%
)

@REM 2. Check IntelliJ bundled Maven
@SET IDEA_MAVEN=C:\Users\OM\AppData\Local\JetBrains\IntelliJ IDEA Community Edition 2024.1.1\plugins\maven\lib\maven3\bin\mvn.cmd
@IF EXIST "%IDEA_MAVEN%" (
    @"%IDEA_MAVEN%" %*
    @EXIT /B %ERRORLEVEL%
)

@ECHO [ERROR] Maven not found. Please install Apache Maven or run using your IDE.
@EXIT /B 1
