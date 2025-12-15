Indicaciones del proyecto
Link del Front-end: https://github.com/alfr-alvarz/examen-frontend.git

Base de Datos hecha en XAMPP con MySQL. Utilizando el puerto 3306. Se conecta a test.

Este backend tiene como url http://localhost:8080/

Incluye Swagger para ver los distintos endpoints, y posee dos roles ('ADMIN' y 'CLIENTE') para definir autorizaciones en los endpoints.

Datos para loguearse:

 ADMIN_EMAIL = 'admin@tienda.com';
 ADMIN_PASS = '123456';

 VENDEDOR_EMAIL = 'juan@tienda.com';
 VENDEDOR_PASS = '123456';
USAR bdd.sql PARA HACER INSERCIONES EN LA BD ANTES DE EJECUTAR

Instalación del proyecto
# Instalar CLI de NestJS de forma global
$ npm install -g @nestjs/cli

#Verificar instalación
$ nest --version

#Creado proyecto en carpeta actual
$ nest new .

#Dependencias para conectar con MySQL
$ npm install --save @nestjs/typeorm typeorm mysql2

#Modulo de configuración
$ npm install @nestjs/config

#Instalaciones para JWT
npm install @nestjs/jwt @nestjs/passport passport passport-jwt
npm install --save-dev @types/passport-jwt
npm install bcryptjs

#Instalación de validadores
npm install class-validator class-transformer

#Instalación del Swagger
npm install --save @nestjs/swagger swagger-ui-express

Description
Nest framework TypeScript starter repository.

Project setup
$ npm install
Compile and run the project
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
Run tests
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
License
Nest is MIT licensed.