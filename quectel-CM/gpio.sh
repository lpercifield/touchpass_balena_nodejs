echo "pinctl GPIO script"
echo "Setting up outputs."

#pinctrl 18 op dl


pinctrl set 6 op dl
#pinctrl set 19 op dl
sleep 1
#RELAY="586"
OUT="586 588 591 592"
IN="593 594 595 596"
pinctrl set 6 op dh
#pinctrl set 19 op dh pu
#pinctrl 18 op dh

sleep 1

# GPIO
num=1
nnum=1
if [ "x$OUT" != "x" ]; then
	for i in $OUT; do
	[ ! -d /sys/class/gpio/gpio$i ] && echo $i > /sys/class/gpio/export
	echo out > /sys/class/gpio/gpio$i/direction
	chmod a+w /sys/class/gpio/gpio$i/value
	ln -sf /sys/class/gpio/gpio$i/value /dev/chipsee-gpio$num
	ln -sf /sys/class/gpio/gpio$i/value /dev/gpio-out$nnum
	num=`expr $num + 1`
	nnum=`expr $nnum + 1`
	done            
fi

sleep 1         

nnum=1
if [ "x$IN" != "x" ]; then
	for i in $IN; do
	[ ! -d /sys/class/gpio/gpio$i ] && echo $i > /sys/class/gpio/export
	echo in > /sys/class/gpio/gpio$i/direction
	chmod a+r /sys/class/gpio/gpio$i/value
	ln -sf /sys/class/gpio/gpio$i/value /dev/chipsee-gpio$num
	ln -sf /sys/class/gpio/gpio$i/value /dev/gpio-in$nnum
	num=`expr $num + 1`
	nnum=`expr $nnum + 1`
	done
fi

if [ "x$RELAY" != "x" ]; then
        [ ! -d /sys/class/gpio/gpio$RELAY ] && echo $RELAY > /sys/class/gpio/export
        echo low > /sys/class/gpio/gpio$RELAY/direction
        chmod a+w /sys/class/gpio/gpio$RELAY/value
        ln -sf /sys/class/gpio/gpio$RELAY/value /dev/relay
fi
# echo "waiting for modem 20"
sleep 10
echo "checking modem"
# Define APN details
APN="h2g2"
# Optional: USERNAME="user"
# Optional: PASSWORD="password"
IP_TYPE="ipv4v6" # Or ipv4, ipv6 as required by your carrier

# Find the modem index
MODEM_INDEX=$(mmcli -L | grep -oP 'Modem/\K\d+')

COUNTER=0

while [[ -z "$MODEM_INDEX" && "$COUNTER" -lt 7 ]]; do
    echo "No modem found. retry..."
	sleep 10
    MODEM_INDEX=$(mmcli -L | grep -oP 'Modem/\K\d+')
	((COUNTER++))
done

if [ -z "$MODEM_INDEX" ]; then
	echo "No modem found. exiting"
	exit 1
fi

echo "Found modem with index: $MODEM_INDEX"

# Construct connection string
CONNECT_CMD="apn=$APN,ip-type=$IP_TYPE"
# Optional: Add user and password if needed
# CONNECT_CMD="$CONNECT_CMD,user=$USERNAME,password=$PASSWORD"

echo "Connecting to APN: $APN"

# Execute the simple connect command
mmcli -m "$MODEM_INDEX" --simple-connect="$CONNECT_CMD"

if [ $? -eq 0 ]; then
    echo "Connection successful."
	nmcli connection show "ModemConn" > /dev/null 2>&1
	if [ $? -eq 0 ]; then
    	echo "Connection 'ModemConn' exists."
		nmcli con up "ModemConn"
	else
    	echo "Connection 'ModemConn' does not exist."
		nmcli con add type gsm ifname cdc-wdm0 con-name "ModemConn" apn "h2g2"
		nmcli con up "ModemConn"
	fi
    # You can add further steps here, like checking IP address or running a ping test
else
    echo "Connection failed. Check logs in /var/log/syslog for details."
fi

# #!/usr/bin/env bash

# su - -c "mkdir -p /mnt/nvme" root
# device=$(blkid | grep "LABEL=\"nvme\"" | cut -d : -f 1)
# echo "Mounting device = ${device}"
# su - -c "mount -t ext4 -o rw ${device} /mnt/nvme" root

# May want to call the parent image entrypoint instead
# exec docker-entrypoint.sh "$@"
exec "$@"
