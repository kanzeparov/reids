#!/bin/bash

readonly net_id=1

info() {
    echo -e "{ \"datetime\": \"$(date +"%D %T")\", \"loglevel\": \"info\", \"message\": \"$*\" }" >&2;
}

error() {
    echo -e "{ \"datetime\": \"$(date +"%D %T")\", \"loglevel\": \"error\", \"message\": \"$*\" }" >&2;
    exit 1;
}

cleanup_on_exit() {
    if [ -f $SNAP_DATA/hostapd.pid ]; then
	    read HOSTAPD_PID <$SNAP_DATA/hostapd.pid
	    if [ -n "$HOSTAPD_PID" ] ; then
            kill -9 $HOSTAPD_PID || true
            rm -f $SNAP_DATA/hostapd.pid || true
	    fi
    else
        ps auxw | grep [h]ostapd | awk '{print $2}' | xargs kill -9 || true
        info "hostapd isn't running"
    fi

    if [ -f $SNAP_DATA/dnsmasq.pid ]; then
	    read DNSMASQ_PID <$SNAP_DATA/dnsmasq.pid
	    if [ -n "$DNSMASQ_PID" ] ; then
		    # If dnsmasq is already gone don't error out here
            kill -9 $DNSMASQ_PID || true
            rm -f $SNAP_DATA/dnsmasq.pid || true
	    fi
    else
        ps auxw | grep [d]nsmasq | awk '{print $2}' | xargs kill -9 || true
        info "dnsmasq isn't running"
    fi
}

is_ap() {
    if pgrep -x "hostapd" > /dev/null && pgrep -x "dnsmasq" > /dev/null; then
        info "hostapd and dnsmasq is running"
        return 0
    else
        info "hostapd or dnsmasq isn't running"
        return 1
    fi
}

STDERR() {
    cat - 1>&2
}

check_requirements() {
    local _bin=${1}
    [ -f "${1}" ] || error "not found ${_bin}"
}

get_ipaddr() {
    local _iface=$1
    local output
    output=$(ip -4 addr show "${_iface}" | grep inet | awk '{print $2}')
    echo $output
}

get_gateway() {
    local output
    output=$(ip route | awk '/default/ { print $3 }')
    echo $output
}

get_dns() {
    local output
    output=$(cat /etc/resolv.conf | grep ^nameserver | awk '{print $2}' | awk 'BEGIN { ORS = " " } { print }')
    echo $output
}

get_wifi_ssid() { 
    local ssid=$(wpa_cli get_network "${net_id}" ssid | tail -n1)

    echo $ssid
}

get_wifi_encryption() { 
    local encryption=$(wpa_cli get_network "${net_id}" key_mgmt | tail -n1)

    echo $encryption
}

get_wifi_key() { 
    local ssid=${1}
    local encryption=${2}

    case ${encryption} in
    'NONE')
        local key=""
        ;;
    'WPA-PSK')
        local key=$(cat /etc/wpa_supplicant/wpa_supplicant.conf | grep -A4 "${ssid}" | grep "psk" | awk -F'=' '{print $2}')
        ;;
    *)
        local key=""
        ;;
    esac

    echo $key
}

generate_dnsmasq_config() {
    { \
	    echo "port=53"; \
	    echo "all-servers"; \
	    echo "interface=$WIFI_INTERFACE"; \
	    echo "except-interface=lo"; \
	    echo "listen-address=$WIFI_ADDRESS"; \
	    echo "bind-interfaces"; \
	    echo "dhcp-range=$DHCP_RANGE_START,$DHCP_RANGE_STOP,$DHCP_LEASE_TIME"; \
	    echo "dhcp-option=6, $WIFI_ADDRESS"; \
	} > "${1}"
}

generate_hostapd_config() {
    { \
        echo "interface=$WIFI_INTERFACE"; \
        echo "driver=nl80211"; \
        echo "channel=$WIFI_CHANNEL"; \
        echo "macaddr_acl=0"; \
        echo "ignore_broadcast_ssid=0"; \
        echo "ieee80211n=1"; \
        echo "ssid=$WIFI_SSID"; \
        echo "auth_algs=1"; \
        echo "utf8_ssid=1"; \
        echo "hw_mode=$WIFI_OPERATION_MODE"; \
        echo "dtim_period=3"; \
        echo "wmm_enabled=1"; \
        echo "country_code=$WIFI_COUNTRY_CODE"; \
    } > "${1}"
}

generate_wpasupplicant_config() {
    case ${_encryption} in
    'WPA')
        { \
            echo "country=$WIFI_COUNTRY_CODE"; \
            echo ""; \
            echo "network={"; \
            echo " ssid=\"${_ssid}\""; \
            echo " psk=\"${_key}\""; \
            echo " key_mgmt=WPA-PSK"; \
            echo "}"; \
        } > ${1}
        ;;
    *)
        { \
            echo "country=$WIFI_COUNTRY_CODE"; \
            echo ""; \
            echo "network={"; \
            echo " ssid=\"${_ssid}\""; \
            echo " key_mgmt=NONE"; \
            echo "}"; \
        } > ${1}
        ;;
    esac
}

setup_client() {
    local _ssid=$(echo "${1}" | openssl enc -d -base64)
    local _encryption=$(echo "${2}" | openssl enc -d -base64)
    local _key=$(echo "${3}" | openssl enc -d -base64)

    generate_wpasupplicant_config /etc/wpa_supplicant/wpa_supplicant.conf
}
