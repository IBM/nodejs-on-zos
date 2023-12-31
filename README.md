# Node.js on zOS (Wazi Sandbox)

The repository contains a simple application that is used as a baseline to demonstrate how to run a **Node.js** application on a zOS using the [Wazi Sandbox environment](https://www.ibm.com/docs/en/cloud-paks/z-modernization-stack/2023.2?topic=host-option-1-managing-development-test-environments-sandbox), a solution that emulates zOS on OCP x86.

The application exposes various endpoints to perform operations to CREATE, READ, UPDATE, and DELETE one or more user entities stored in a **DB2** database hosted by the **Wazi Sandbox**.

All the endpoints require no authentication.

| Method   | URL                | Query Parameters        | Body       | Return Content | Description                                |
| -------- | ------------------ | ----------------------- | ---------- | -------------- | ------------------------------------------ |
| GET    | `/`                | -                       | -          | PLAIN_TEXT     | Endpoint to check if the server is running |
| GET    | `/users`           | -                       | -          | UserEntity[]   | Return a list of users                   |
| GET    | `/user/:email`     | -                       | -          | UserEntity     | Return a user filtered by email            |
| POST   | `/user`            | -                       | UserEntity | UserEntity     | Create new user                          |
| DELETE | `/user/:email`     | -                       | -          | PLAIN_TEXT     | Delete user by email                     |
| PATCH  | `/user/:email`     | firstname, lastname     | -          | UserEntity     | Update the user's fields by email          |

**UserEntity:**

```json
{
    "firstname":"firstname",
    "lastname":"lastname",
    "email":"name.lastname@example.com"
}
```

## Application structure

Below is the folder structure of the application with a description for each file:

```sh
.
├── __scripts__
│   └── script.sh            
├── __tests__
│   └── user_service.test.js 
├── src
│   ├── db2.js              
│   └── server.js            
├── .env                     
├── jest.config.js           
└── package.json             
```

1. `__scripts__/script.sh`:
Shell script used to call the Rest APIs exposed by the Node.js application.

1. `__tests__/user_service.test.js`:
Jest file containing a single test to check one method of the Node.js.

1. `src/db2.js`:
File containing a Rest client used to call the Rest APIs exposed by DB2.

1. `src/server.js`:
File containing the Rest APIs exposed by the Node.js application

1. `.env`:
Key-value properties used by the application.

1. `jest.config.js`:
Jest framework configuration file.

1. `package.json`:
Json file contains descriptive and functional metadata about a project, such as a name, version, and dependencies.

## Requirements

To ensure that the application runs without errors, you must enable and configure the **DB2 REST Service** to expose the REST APIs from DB2, and you must also modify the **.env** file.

### How to enable/configure DB2 Rest Service

To enable and configure DB2 to expose SQL queries through Rest APIs, you must follow the steps below:

- Create the `CUST` table under the `IBMUSER` schema in the **Wazi Sandbox** environment:

```sql
CREATE TABLE "IBMUSER"."CUST" (
        "EMAIL" CHAR(2) FOR SBCS DATA WITH DEFAULT NULL, 
        "FIRSTNAME" CHAR(12) FOR SBCS DATA WITH DEFAULT NULL, 
        "LASTNAME" CHAR(6) FOR SBCS DATA WITH DEFAULT NULL
)
AUDIT NONE
DATA CAPTURE NONE 
CCSID EBCDIC;
```

> **NOTE:** To check if the table has been created correctly, you can use the query `SELECT * FROM "IBMUSER".CUST`.

- Expose the `/services/db2/findall` Rest API using the following **JCL**.

```jcl
//IBMUSER1  JOB SYS0000,
//             IBMUSER,        **JOB STATEMENT GENERATED BY SUBMIT**
//             NOTIFY=IBMUSER,
//             MSGLEVEL=(1,1)
//BIND EXEC PGM=IKJEFT01,DYNAMNBR=20
//STEPLIB DD DSN=DSNC10.DBCG.SDSNEXIT,DISP=SHR
//DD DSN=DSNC10.SDSNLOAD,DISP=SHR
//* replace DSNC10.DBCG.SDSNEXIT & DSNC10.SDSNLOAD with the right libraries in your environment
//SYSTSPRT DD SYSOUT=*
//SYSPRINT DD SYSOUT=*
//SYSUDUMP DD SYSOUT=*
//DSNSTMT DD *
 SELECT * FROM IBMUSER."CUST"
//SYSTSIN DD *
DSN SYSTEM(DSNSYSTEM)
//* replace DSNSYSTEM with the right database name
BIND SERVICE(db2) -
NAME("findall") -
SQLENCODING(1047) -
DESCRIPTION('findall from table IBMUSER.CUST’)
/*
```

- Expose the `/services/db2/findbyemail` Rest API using the following **JCL**.

```jcl
//IBMUSER1  JOB SYS0000,
//             IBMUSER,        **JOB STATEMENT GENERATED BY SUBMIT**
//             NOTIFY=IBMUSER,
//             MSGLEVEL=(1,1)
//BIND EXEC PGM=IKJEFT01,DYNAMNBR=20
//STEPLIB DD DSN=DSNC10.DBCG.SDSNEXIT,DISP=SHR
//DD DSN=DSNC10.SDSNLOAD,DISP=SHR
//* replace DSNC10.DBCG.SDSNEXIT & DSNC10.SDSNLOAD with the right libraries in your environment
//SYSTSPRT DD SYSOUT=*
//SYSPRINT DD SYSOUT=*
//SYSUDUMP DD SYSOUT=*
//DSNSTMT DD *
 SELECT * FROM IBMUSER."CUST" WHERE "email"=:email
//SYSTSIN DD *
DSN SYSTEM(DSNSYSTEM)
//* replace DSNSYSTEM with the right database name
BIND SERVICE(db2) -
NAME("findbyemail") -
SQLENCODING(1047) -
DESCRIPTION('findbyemail from table IBMUSER.CUST’)
/*
```

- Expose the `/services/db2/deletebyemail` Rest API using the following **JCL**.

```jcl
//IBMUSER1  JOB SYS0000,
//             IBMUSER,        **JOB STATEMENT GENERATED BY SUBMIT**
//             NOTIFY=IBMUSER,
//             MSGLEVEL=(1,1)
//BIND EXEC PGM=IKJEFT01,DYNAMNBR=20
//STEPLIB DD DSN=DSNC10.DBCG.SDSNEXIT,DISP=SHR
//DD DSN=DSNC10.SDSNLOAD,DISP=SHR
//* replace DSNC10.DBCG.SDSNEXIT & DSNC10.SDSNLOAD with the right libraries in your environment
//SYSTSPRT DD SYSOUT=*
//SYSPRINT DD SYSOUT=*
//SYSUDUMP DD SYSOUT=*
//DSNSTMT DD *
 DELETE FROM IBMUSER."CUST" WHERE "email"=:email
//SYSTSIN DD *
DSN SYSTEM(DSNSYSTEM)
//* replace DSNSYSTEM with the right database name
BIND SERVICE(db2) -
NAME("deletebyemail") -
SQLENCODING(1047) -
DESCRIPTION('deletebyemail from table IBMUSER.CUST’)
/*
```

- Expose the `/services/db2/update` Rest API using the following **JCL**.

```jcl
//IBMUSER1  JOB SYS0000,
//             IBMUSER,        **JOB STATEMENT GENERATED BY SUBMIT**
//             NOTIFY=IBMUSER,
//             MSGLEVEL=(1,1)
//BIND EXEC PGM=IKJEFT01,DYNAMNBR=20
//STEPLIB DD DSN=DSNC10.DBCG.SDSNEXIT,DISP=SHR
//DD DSN=DSNC10.SDSNLOAD,DISP=SHR
//* replace DSNC10.DBCG.SDSNEXIT & DSNC10.SDSNLOAD with the right libraries in your environment
//SYSTSPRT DD SYSOUT=*
//SYSPRINT DD SYSOUT=*
//SYSUDUMP DD SYSOUT=*
//DSNSTMT DD *
UPDATE FROM IBMUSER.CUST SET "firstname"=:firstname, "lastname"=:lastname WHERE "email"=:email
//SYSTSIN DD *
DSN SYSTEM(DSNSYSTEM)
//* replace DSNSYSTEM with the right database name
BIND SERVICE(db2) -
NAME("update") -
SQLENCODING(1047) -
DESCRIPTION('update from table IBMUSER.CUST’)
/*
```

> **NOTE:** Remember to replace the placeholders `DSNSYSTEM`, `DSNC10.DBCG.SDSNEXIT` and `DSNC10.SDSNLOAD` in each JCL file with the correct values. For more information on how to change these values, see the official [IBM documentation](https://www.ibm.com/docs/en/zos-connect/zosconnect/3.0?topic=services-creating-enabling-db2-native-rest).

### How to modify the .env file

The **.env** provides a convenient way to store the environment specific variables.

These variables are not the same for every Wazi Sandbox environment, so it is important to understand the purpose of each variable to set the correct value.

1. `WAZI_SANDBOX_DB2_IP`:
This variable contains the IP address value of the endpoint used by DB2 to expose the Rest APIs. Since the Node.js application runs directly inside the Wazi Sandbox and the database runs in the same environment, the value to use is **localhost**.

1. `WAZI_SANDBOX_DB2_PORT`:
This variable contains the port value of the endpoint used by DB2 to expose the Rest APIs. Typically, the default port value for DB2 hosted by Wazi Sandbox is **5040**, if you have made some changes to the environment, set it to the correct value.

1. `WAZI_SANDBOX_USER`:
User enabled to call the Rest APIs exposed by DB2.

1. `WAZI_SANDBOX_PASSWORD`:
Password of the user enabled to call the Rest APIs exposed by DB2.

## Run application in Wazi Sandbox

To run the application in Wazi Sandbox, you have several ways to download/push the source code into the USS filesystem. One of them is to use the `git` command to clone the code from the repository.

To do this, you can use `ssh` to connect to the Wazi sandbox and execute the command:

`git -c http.sslVerify=false clone https://github.com/IBM/nodejs-on-zos.git`.

```sh
IBMUSER : /u/ibmuser : > git -c http.sslVerify=false clone https://github.com/IBM/nodejs-on-zos.git
Cloning into 'nodejs-on-zos'...
remote: Enumerating objects: 16, done.
remote: Counting objects: 100% (16/16), done.
remote: Compressing objects: 100% (15/15), done.
remote: Total 16 (delta 0), reused 16 (delta 0), pack-reused 0
Receiving objects: 100% (16/16), 6.23 KiB | 1.04 MiB/s, done.
```

At this point, a new folder named `nodejs-on-zos` has been created in the file system, go to the new folder (`cd nodejs-on-zos`) and run the `npm install` command, which will install all the dependencies needed to run the application.

```sh
IBMUSER : /u/ibmuser/nodejs-on-zos : > npm install
added 381 packages, and audited 382 packages in 30s

44 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

Now you have to edit the variables in the **.env** file, update the values of the `WAZI_SANDBOX_USER` and `WAZI_SANDBOX_PASSWORD` variables and edit the others if necessary.

```sh
IBMUSER : /u/ibmuser/nodejs-on-zos : > vi .env
WAZI_SANDBOX_DB2_IP=localhost
WAZI_SANDBOX_DB2_PORT=5040
WAZI_SANDBOX_USER=
WAZI_SANDBOX_PASSWORD=
~
~
~
...
".env" 5 lines, 98 characters
```

Finally you can execute `npm test` and after `npm start` to test and run the Node.js application:

```sh
IBMUSER : /u/ibmuser/nodejs-on-zos : > npm test

> nodejs-on-zos@1.0.0 test
> jest --runInBand --setupFiles dotenv/config

 PASS  __tests__/user_service.test.js
  ✓ Test the Rest API at path / (77 ms)

Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total
Snapshots:   0 total
Time:        1.117 s
Ran all test suites.
```

```sh
IBMUSER : /u/ibmuser/nodejs-on-zos : > npm start

> nodejs-on-zos@1.0.0 start
> node -r dotenv/config src/server.js dotenv_config_path=.env

Server is running and listening at port http://localhost:1339
```

At this point the application is listening on port `1339`!

> **NOTE**: If you don't have the `git` command installed on your sandbox, you can use `scp` to copy the files from your workstation to Wazi.

## Test application in Wazi Sandbox

Now that the application is up and running, you can use the **script.sh** file to test the endpoints.

Open a new ssh connection to the Wazi Sandbox and go to the `nodejs-on-zos` folder, after which you can run the command:

 `sh __scripts__/script.sh` 

```sh
IBMUSER : /u/ibmuser : > cd nodejs-on-zos
IBMUSER : /u/ibmuser/nodejs-on-zos : > sh __scripts__/script.sh
Choose option:
1) Get all users
2) Get user by email
3) Create user
4) Delete user
5) Update user
>
```

> **NOTE**: It is important to have `curl` installed in the sandbox to test the application because the script uses `curl` to call the APIs exposed.
