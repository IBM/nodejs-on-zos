#!/bin/bash
DIR=`dirname $BASH_SOURCE`
URL=http://localhost:1339

clear

printStatus() {
echo "Choose option:
1) Get all users
2) Get user by email
3) Create user
4) Delete user
5) Update user"
printf "> "
read VALUE;
}

execute() {
    case $VALUE in
    1)
        echo; echo "--------------------------------------------------"
        curl -i -s $URL/users
        echo; echo "--------------------------------------------------";
        ;;

    2)
        printf "EMAIL: "
        read EMAIL
        echo; echo "--------------------------------------------------"
        curl -s -i "$URL/user/$EMAIL"
        echo; echo "--------------------------------------------------";
        ;;

    3)
        printf "FIRSTNAME: "
        read FIRSTNAME
        printf "LASTNAME: "
        read LASTNAME
        printf "EMAIL: "
        read EMAIL
        echo; echo "--------------------------------------------------"
        curl -s -i -X POST --data-raw "{ \"firstname\": \"$FIRSTNAME\", \"lastname\": \"$LASTNAME\", \"email\": \"$EMAIL\"}" -H "Content-Type: application/json" "$URL/user"
        echo; echo "--------------------------------------------------";
        ;;

    4)
        printf "EMAIL: "
        read EMAIL
        echo; echo "--------------------------------------------------"
        curl -s -i -X DELETE "$URL/user/$EMAIL"
        echo; echo "--------------------------------------------------";
        ;;

    5)
        printf "EMAIL: "
        read EMAIL
        printf "FIRSTNAME: "
        read FIRSTNAME
        printf "LASTNAME: "
        read LASTNAME
        echo; echo "--------------------------------------------------"
        curl -s -i -X PATCH -G "$URL/user/$EMAIL" --data-urlencode "firstname=$FIRSTNAME" --data-urlencode "lastname=$LASTNAME"
        echo; echo "--------------------------------------------------";
        ;;

    0 | exit)
       exit
       ;;
    *)
       clear
       ;;
    esac
}

while true; do
    printStatus
    execute
done