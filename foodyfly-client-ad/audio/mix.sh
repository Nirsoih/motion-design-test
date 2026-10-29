#!/bin/bash
# Builds public/audio/mix.wav: voiceover placed on the timeline, music ducked under it, sfx on top.
set -e
cd "$(dirname "$0")/../public/audio"
T=(1.0 5.7 10.9 15.8 21.6 28.4 36.0 39.6 44.4 48.0)
IN=""; F=""; L=""
for i in $(seq 1 10); do n=$(printf "%02d" $i); ms=$(echo "${T[$((i-1))]}*1000/1" | bc); IN="$IN -i vo/vo$n.wav"; F="$F[$((i-1)):a]adelay=${ms}|${ms}[v$i];"; L="$L[v$i]"; done
ffmpeg -v error -y $IN -i music.wav -i sfx.wav -filter_complex "${F}${L}amix=inputs=10:normalize=0,apad=whole_dur=52,volume=1.15,asplit=2[sc][vox];[10:a]volume=1.7[mus];[mus][sc]sidechaincompress=threshold=0.03:ratio=4:attack=25:release=500:makeup=1[duck];[11:a]volume=1.1[fx];[duck][fx][vox]amix=inputs=3:normalize=0,loudnorm=I=-15:TP=-1.2:LRA=9,atrim=0:52[out]" -map "[out]" -ar 48000 -ac 2 mix.wav
