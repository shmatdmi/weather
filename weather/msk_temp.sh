#!/bin/bash

path=/opt/weather
CURRENTDATE=$(date +%d-%m-%Y_%H:%M:)
PATH_WEB="/opt/web/data/index.html"

#Запрос по API
curl -k 'https://api.openweathermap.org/data/2.5/weather?q=Moscow,RU&appid=ba23e3e7888484e7a26b57b215d65200&units=metric' > $path/tmp/msk_data.txt

#Добавление даты и времени в временный файл
echo -n $CURRENTDATE >> $path/msk_temp.txt
echo -n ' ' >> $path/msk_temp.txt
#Обработка jq и отправка данных в основной файл
cat $path/tmp/msk_data.txt | jq '.main.temp' >> $path/msk_temp.txt
#Добавление тега br в файл
echo '<br/>' >> $path/msk_temp.txt

#Добавление картинки на главную страницу сайта
cat /opt/web/data/image.html > $PATH_WEB
echo '<br/>' >> $PATH_WEB

#Добавление текущей даты на web site
echo -n 'Погода в Москве за: ' >> $PATH_WEB
/bin/date +%d-%m-%Y >> $PATH_WEB
echo '<br/>' >> $PATH_WEB


# Добавление новых данных на web site
cat $path/msk_temp.txt >> $PATH_WEB

echo "<br>" >> $PATH_WEB

# Добавление счетчика и данных нижней части сайта на главную страницу
cat /opt/web/data/postaction.html >> $PATH_WEB


