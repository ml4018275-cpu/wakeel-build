#!/usr/bin/env bash
# ============================================================
#  تهيئة بيئة بناء APK — Arena Sandbox
#  شغّل السكربت ده لو البيئة اترست (المسار /home/user/.android-sdk اختفى)
#  الاستخدام:  bash setup-android-env.sh
# ============================================================
set -e

export ANDROID_HOME=/home/user/.android-sdk
export ANDROID_SDK_ROOT=$ANDROID_HOME

echo ">> [1/4] تثبيت JDK 21 ..."
java -version 2>&1 | grep -q "21\." || sudo apt-get install -y openjdk-21-jdk-headless unzip zip

echo ">> [2/4] تحميل Android cmdline-tools ..."
if [ ! -d "$ANDROID_HOME/cmdline-tools/latest" ]; then
  mkdir -p "$ANDROID_HOME/cmdline-tools"
  cd /tmp
  curl -s -o cmdtools.zip https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip
  unzip -q -o cmdtools.zip -d "$ANDROID_HOME/cmdline-tools"
  mv "$ANDROID_HOME/cmdline-tools/cmdline-tools" "$ANDROID_HOME/cmdline-tools/latest"
fi

export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools

echo ">> [3/4] قبول التراخيص ..."
yes | sdkmanager --licenses > /dev/null 2>&1 || true

echo ">> [4/4] تثبيت الحزم (platforms 34+35, build-tools, platform-tools) ..."
sdkmanager "platform-tools" "platforms;android-34" "platforms;android-35" \
           "build-tools;34.0.0" "build-tools;35.0.0" 2>&1 | tail -3

cat > /home/user/.android-env <<'EOF'
export ANDROID_HOME=/home/user/.android-sdk
export ANDROID_SDK_ROOT=/home/user/.android-sdk
export PATH=$PATH:/home/user/.android-sdk/cmdline-tools/latest/bin:/home/user/.android-sdk/platform-tools:/home/user/.android-sdk/build-tools/35.0.0
export JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64
EOF

echo ""
echo "✅ خلصت التهيئة. الحزم المثبتة:"
sdkmanager --list_installed 2>/dev/null | grep -E "build-tools|platforms|platform-tools" || true
echo ""
echo "لتفعيل المتغيرات في أي shell:  source /home/user/.android-env"
