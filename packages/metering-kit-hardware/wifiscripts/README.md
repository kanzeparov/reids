# Wifi management scripts
---


### Конфигурация
* указать интерфейс для конфигурации в файле wifi.sh (5ая строка, по дефолту - wlan0)
* указать SSID для сети в режиме ТД в файле wifi.sh (6ая строка, по дефолту - Onder)

* должны быть установлены следующие пакеты:
```
you should install this packages:
apt-get update -yqq && \
apt-get upgrade -yqq && \
apt-get install hostapd dnsmasq jq -yqq
```
* добавить скрипт в автозапуск `/etc/rc.local` (перед строчкой `exit 0` прописать `my/path/to/script/wifi.sh check_mode`)


### Параметры запуска
1.  `get_settings` - получить сетевые настройки
    * возвращает JSON с настройками сетевого адаптера
    
    ```
    # ./wifi.sh get_settings
    { "operstate": "up", "mac": "7c:8b:ca:15:17:4f", "ip": "10.0.2.1", "gateway": "10.0.2.2", "nameservers": "10.0.2.3" }
    ```

2. `set_ap` - перевести устройство в режим ТД
    * присваивает статический IP на интерфейсе (10.0.0.1)
    * переключает wifi в режим точки доступа
    * включает dhcp сервер (диапазон адресов 10.0.0.2-10.0.0.9)
    
    ```
    # ./wifi.sh set_ap
    { "datetime": "08/07/18 23:27:21", "loglevel": "info", "message": "ok" }
    ```

3. `set_client` - перевести устройство в режим клиента WiFi

4. `save_client` - перевести устройство в режим клиента WiFi и сохранить настройки
    обязательные параметры:
    * wifi_ssid - SSID WiFi сети
    * wifi_encryption - тип шифрования (WEP, WPA, Open)
    * wifi_key - ключ шифрования (в случае Open - None)

    ```
    # ./wifi.sh set_client wifi_ssid wifi_encryption wifi_key
    { "datetime": "08/07/18 23:27:21", "loglevel": "info", "message": "ok" }
    ```
