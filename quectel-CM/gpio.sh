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

#!/usr/bin/env bash

su - -c "mkdir -p /mnt/nvme" root
device=$(blkid | grep "LABEL=\"nvme\"" | cut -d : -f 1)
echo "Mounting device = ${device}"
su - -c "mount -t ext4 -o rw ${device} /mnt/nvme" root

# May want to call the parent image entrypoint instead
# exec docker-entrypoint.sh "$@"
exec "$@"
