plugins {
    id("com.android.application")
}

android {
    namespace = "com.arradfootbalconies.hub"
    compileSdk = 36

    defaultConfig {
        applicationId = "com.arradfootbalconies.hub"
        minSdk = 26
        targetSdk = 36
        versionCode = 2
        versionName = "0.2.0-testing"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
}
