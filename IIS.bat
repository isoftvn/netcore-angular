@echo off
setlocal
set sitename="EzProcess"
set execPath="D:\Development\EzProcess\EzProcess\bin\Debug\netcoreapp3.1\EzProcess.dll"
set configPath="D:\Development\EzProcess\EzProcess\ClientApp\applicationhost.config"
set PATH=%PATH%;C:\Program Files\IIS Express

set LAUNCHER_ARGS=exec %execPath%
set LAUNCHER_PATH=C:\Program Files\dotnet\dotnet.exe
iisexpress /site:%sitename% /config:%configPath%
:: Comment out line below to check for errors
exit