#!/bin/bash

set -eu

readonly DEBUG="false"
readonly SLEEP_TIMEOUT=5

readonly WIFI_INTERFACE="wlan0"

# WiFi AP settings
readonly WIFI_SSID="Onder"
readonly WIFI_CHANNEL="6"
readonly WIFI_OPERATION_MODE="g"
readonly WIFI_COUNTRY_CODE="XX"
readonly WIFI_ADDRESS="10.0.0.1"
readonly WIFI_NETMASK="255.255.255.0"
readonly DHCP_RANGE_START="10.0.0.2"
readonly DHCP_RANGE_STOP="10.0.0.9"
readonly DHCP_LEASE_TIME="1h"

if [ "$DEBUG" == "*" ] || [ "$DEBUG" == "true" ]; then
	set -x
fi

source utils.sh

trap cleanup_on_exit TERM

main() {    
    command="${1:-help}"
    case "${command}" in
        "set_ap")
            ps auxw | grep [w]pa_supplicant | awk '{print $2}' | xargs kill -9 || true
            sleep $SLEEP_TIMEOUT
            ip a flush dev ${WIFI_INTERFACE} || true
            # check current mode
            if is_ap; then
                exit 0
            else
                # set static IP for AP
                ip a flush dev ${WIFI_INTERFACE} || true
                sleep ${SLEEP_TIMEOUT}
                ip a add ${WIFI_ADDRESS}/${WIFI_NETMASK} dev ${WIFI_INTERFACE} || true
                        
                # configure and run dnsmasq
                generate_dnsmasq_config $SNAP_DATA/dnsmasq.conf
                $SNAP/bin/dnsmasq \
                    -k \
                    -C $SNAP_DATA/dnsmasq.conf \
                    -l $SNAP_DATA/dnsmasq.leases \
                    -x $SNAP_DATA/dnsmasq.pid \
                    -u root -g root \
                &

                # configure and run hostapd
                generate_hostapd_config $SNAP_DATA/hostapd.conf
                EXTRA_ARGS=
                if [ "$DEBUG" == "*" ] || [ "$DEBUG" == "true" ]; then
                    EXTRA_ARGS="$EXTRA_ARGS -ddd -t"
                fi

                hostapd=$SNAP/bin/hostapd
                $hostapd $EXTRA_ARGS $SNAP_DATA/hostapd.conf &
                hostapd_pid=$!
                echo $hostapd_pid > $SNAP_DATA/hostapd.pid
                wait $hostapd_pid
            fi

            exit 0
            ;;
        "set_client")
            cleanup_on_exit

            ip a flush dev ${WIFI_INTERFACE} || true
            ifdown --force ${WIFI_INTERFACE} || true
            sleep ${SLEEP_TIMEOUT}
            ifup --force ${WIFI_INTERFACE} || true

            cleanup_on_exit
            exit 0
            ;;
        "save_client")
            cleanup_on_exit

            local _wifi_ssid=${2}
            local _wifi_encryption=${3}
            local _wifi_key=${4}

            setup_client "${_wifi_ssid}" "${_wifi_encryption}" "${_wifi_key}"

            ip a flush dev ${WIFI_INTERFACE} || true
            ifdown --force ${WIFI_INTERFACE} || true
            sleep ${SLEEP_TIMEOUT}
            ifup --force ${WIFI_INTERFACE} || true

            cleanup_on_exit
            exit 0
            ;;
        "get_settings")
            # check if device is exist
            check_requirements "/sys/class/net/${WIFI_INTERFACE}/address"

            ssid=$(get_wifi_ssid)
            encryption=$(get_wifi_encryption)
            key=$(get_wifi_key "${ssid}" "${encryption}")

            # create answer
            json_output=$(jq -n \
                --arg mac "$(cat /sys/class/net/${WIFI_INTERFACE}/address)" \
                --arg opstate "$(cat /sys/class/net/${WIFI_INTERFACE}/operstate)" \
                --arg ip "$(get_ipaddr $WIFI_INTERFACE)" \
                --arg gateway "$(get_gateway)" \
                --arg nameservers "$(get_dns)" \
                --arg ssid "${ssid}" \
                --arg encryption "${encryption}" \
                --arg key "${key}" \
                '{operstate: $opstate, mac: $mac, ip: $ip, gateway: $gateway, nameservers: $nameservers, ssid: $ssid, encryption: $encryption, key: $key}' )
            
            echo "$json_output"
            ;;
        *)
            info "usage ${0} get_settings|set_ap|set_client|save_client wifi_ssid|wifi_encryption|wifi_key"
            error "Unexpected parameter"
            ;;
    esac
}

if [ "$EUID" -ne 0 ]; then
    error "Must be root"
else
    main "$@"
fi
