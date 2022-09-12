#!/bin/bash
set -e
set +x

# install pulseaudio
echo "Installing PulseAudio sound server..." && \
apt -qq update && \
apt install -y pulseaudio && \
adduser root pulse-access && \
clear

# be "stateless" on startup, otherwise pulseaudio daemon won't start
#echo "Clearing PulseAudio state..." && \
rm -rf /var/run/pulse /var/lib/pulse /root/.config/pulse

# run pulseaudio server as non-exitable system daemon
echo "Running PulseAudio sound server (daemon)..." && \
pulseaudio -D --verbose --exit-idle-time=-1 --system --disallow-exit

# create a virtual sink (virtual_speaker) which 'sinks' the (default) output 'monitor' source
echo "Creating interface: virtual_speaker" && \
pactl load-module module-null-sink sink_name="virtual_speaker" sink_properties=device.description="virtual_speaker"

# create a virtual source (virtual_mic) taking the previously-created virtual sink (virtual_speaker) as input
echo "Creating interface: virtual_mic" && \
pactl load-module module-remap-source master="virtual_speaker.monitor" source_name="virtual_mic" source_properties=device.description="virtual_mic" && \
echo ""

# run a command, if passed
if [ -n "$1" ]
then
  $1
fi