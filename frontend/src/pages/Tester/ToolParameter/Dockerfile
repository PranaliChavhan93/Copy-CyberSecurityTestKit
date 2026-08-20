FROM kalilinux/kali-rolling

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    nmap \
    netdiscover \
    enum4linux \
    amass \
    sublist3r \
    masscan \
    nikto \
    whatweb \
    dirsearch \
    sqlmap \
    tcpdump \
    netcat-openbsd \
    socat \
    aircrack-ng \
    kismet \
    binwalk \
    busybox \
    binutils \
    strace \
    ltrace \
    radare2 \
    apktool \
    apktool \
    mobsf \
    androguard \
    scrcpy \
    fridAa \
    adb \
    drozer \
    objection \
    empire \
    theharvester \
    wireshark \



    adb \
    qemu-user \
    openocd \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /tools

COPY requirements.txt .

RUN pip3 install --break-system-packages -r requirements.txt

COPY . .

CMD ["tail", "-f", "/dev/null"]