# Prepping the Yun for Johnny-Five and Nitrogen

1. Bring up, configure for network: http://arduino.cc/en/Guide/ArduinoYun (Configuring the Onboard WiFi)
2. Upgrade to latest OpenWRT: http://arduino.cc/en/Tutorial/YunSysupgrade
3. Expand onto SD: http://arduino.cc/en/Tutorial/ExpandingYunDiskSpace
    1. Use 4096 for the expansion 
4. Add Swap: http://www.cambus.net/getting-started-with-openwrt/
    1. dd if=/dev/zero of=/swapfile count=512 bs=1M
    2. mkswap /swapfile
    3. swapon /swapfile
    4. Edit /etc/config/fstab, thusly:
    config swap
    option device    /swapfile
    5. /etc/init.d/fstab enable
5. opkg update
6. opkg install binutils
7. wget  http://downloads.arduino.cc/openwrtyun/1/packages/yun-gcc_4.6.2-2_ar71xx.ipk
8.  opkg install --force-overwrite yun-gcc_4.6.2-2_ar71xx.ipk
9. opkg update
  # vi sometimes generates xterm errors
    1. opkg install vim
10. Install Node: http://blog.arduino.cc/2014/05/06/time-to-expand-your-yun-disk-space-and-install-node-js/
    1. opkg install node
11. Serialport/johnny-five/firmata update (2nd half of): http://linino.org/doku.php?id=wiki:nodejs
    1. opkg install node-serialport
    2. npm install –g johnny-five

    3. sed -i -e 's/ttyATH0/# ttyATH0/g' /etc/inittab
12. npm install –g nitrogen
13. npm install –g nitrogen-cli
14. opkg install alljoyn-samples alljoyn-sample_apps