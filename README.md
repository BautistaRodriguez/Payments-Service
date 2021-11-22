# Payments-Service


### Comandos:

Correr el listener:

npm run start 

Crear una wallet:

http POST http://localhost:3000/wallet

Obtener los datos de todas las wallets:

http GET http://localhost:3000/wallet

Obtener los datos de una wallet particular:

http GET http://localhost:3000/wallet/{id}

Para enviar plata al smart contract

http POST http://localhost:3000/deposit senderId=2 amountInEthers=0.00001

