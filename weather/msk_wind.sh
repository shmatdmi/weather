#!/bin/bash

path=/opt/weather
CURRENTDATE=$(date +%d-%m-%Y_%H:%M:)
PATH_WEB="/opt/web/data/wind.html"

#Запрос по API
curl -k 'https://api.openweathermap.org/data/2.5/weather?q=Moscow,RU&appid=ba23e3e7888484e7a26b57b215d65200&units=metric' > $path/tmp/msk_data.txt

#Добавление даты и времени в временный файл
echo -n $CURRENTDATE >> $path/msk_wind.txt
echo -n ' ' >> $path/msk_wind.txt
#Обработка jq и отправка данных в основной файл
cat $path/tmp/msk_data.txt | jq '.wind.speed' >> $path/msk_wind.txt
#Добавление тега br в файл
echo '<br/>' >> $path/msk_wind.txt

#Добавление картинки на страницу wind
cat /opt/web/data/image.html > $PATH_WEB
echo '<br/>' >> $PATH_WEB

#Добавление текущей даты на web site
echo -n 'Скорость ветра в Москве за: ' >> $PATH_WEB
/bin/date +%d-%m-%Y >> $PATH_WEB
echo '<br/>' >> $PATH_WEB


# Добавление новых данных на web site
cat $path/msk_wind.txt >> $PATH_WEB
