#!/bin/bash

path="/opt/weather"

#Ротация данных о температуре в Москве
cp $path/msk_temp.txt $path/logs/msk_temp/stat-$(date +%d-%m-%Y)
rm -f $path/msk_temp.txt

#Ротация данных о скорости ветра в оскве
cp $path/msk_wind.txt $path/logs/msk_wind/stat-$(date +%d-%m-%Y)
rm -f $path/msk_wind.txt


cp $path/nvrsk_temp.txt $path/logs/nvrsk_temp/stat-$(date +%d-%m-%Y)
rm -f $path/nvrsk_temp.txt


