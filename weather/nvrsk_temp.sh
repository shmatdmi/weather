#!/bin/bash

path=/opt/weather
CURRENTDATE=$(date +%d-%m-%Y_%H:%M:)
PATH_WEB="/opt/web/data/nvrsk.html"

#Запрос по API. Временно заменил на Анапу, пока не работает датчик в Новороссийске
curl -k 'https://api.openweathermap.org/data/2.5/weather?q=Anapa,RU&appid=ba23e3e7888484e7a26b57b215d65200&units=metric' > $path/tmp/nvrsk_data.txt

#Добавление даты и времени в временный файл
echo -n $CURRENTDATE >> $path/nvrsk_temp.txt
echo -n ' ' >> $path/nvrsk_temp.txt
#Обработка jq и отправка данных в основной файл
cat $path/tmp/nvrsk_data.txt | jq '.main.temp' >> $path/nvrsk_temp.txt
#Добавление тега br в файл
echo '<br/>' >> $path/nvrsk_temp.txt

#Добавление картинки на главную страницу сайта
cat /opt/web/data/image.html > $PATH_WEB
echo '<br/>' >> $PATH_WEB

#Добавление текущей даты на web site. Временно заменил в запросе город на Анапу, пока не работает датчик в Новороссийске
echo -n 'Погода в Анапе за: ' >> $PATH_WEB
/bin/date +%d-%m-%Y >> $PATH_WEB
echo '<br/>' >> $PATH_WEB


# Добавление новых данных на web site
cat $path/nvrsk_temp.txt >> $PATH_WEB
