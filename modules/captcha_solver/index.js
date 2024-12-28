/* 
 * Részletek átvéve a RED által készített userscriptből.
 * Eredeti licenc: MIT License
 * Copyright (c) 2023 RED
 *
 * A kód módosítva lett a jelen projekt igényeihez. Az eredeti kód szerzői jogi értesítése az alábbi:
 *
 * MIT License
 * Copyright (c) 2023 RED
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */


const name = "Captcha kitöltő";
const id = "captcha_solver";
const description = "Automatikusan kitölti a captcha-kat.";
const options = [];

const CALIBRATION_REQUIRED_ERROR = "CALIBRATION_REQUIRED"
let CALIBRATOR = 1.0;
const BASE_NUMBERPRINTS = [283772, 149985, 158189, 81136, 117179, 108444, 38837, 70606, 292541, 134388];

//Kezelehtővé teszi a hangot
function NormalizeAudio(audioBuffer) {
    const channelData = audioBuffer.getChannelData(0);
    const bufferLength = channelData.length;
    const minAmplitude = 0;
    const maxAmplitude = 0.5;

    // Map the audio data to the range 0 to 255 (byte range)
    const amplitudeRange = maxAmplitude - minAmplitude;
    let normalizedAudio = [];
    for (let i = 0; i < bufferLength; i++) {
        const scaledAmplitude = (Math.abs(channelData[i]) - minAmplitude) / amplitudeRange;
        normalizedAudio.push(Math.round(scaledAmplitude * 255));
    }
    return normalizedAudio;
}

//Ha valamiért nem lenne pontos az olvasás
function getClosest(count) {

    let numbers = BASE_NUMBERPRINTS;

    //CalibratorModifier
    numbers = numbers.map((number, index) => Math.round(number * CALIBRATOR));

    const sensitivity = 2000;

    let closestIndex = 0;
    let closest = Math.abs(numbers[0] - count);

    for (let index = 0; index < numbers.length; index++) {
        const current = numbers[index];
        const closeness = Math.abs(current - count);
        if (closeness < closest) {
            closest = closeness;
            closestIndex = index;
        }
    }
    if (Math.abs(numbers[closestIndex] - count) > sensitivity) throw CALIBRATION_REQUIRED_ERROR;
    return closestIndex
}

// "Lenyomatokat" csinál a hangokból és tömb ként vissza adja azokat
function AudioProcessor(audioBuffer) {

    const normalizedAudio = NormalizeAudio(audioBuffer)

    const bufferLength = normalizedAudio.length

    let AudioSums = [];
    const treshold = 50;
    const sensitivity = 10000;

    for (let index = 0; index < bufferLength - sensitivity; index++) {
        //Amíg minden nulla
        while (normalizedAudio[index] <= treshold && index < bufferLength) { index++ }

        let sum = 0.0;
        while (index < bufferLength) {

            if (normalizedAudio[index] > treshold) {
                sum += normalizedAudio[index];
            }
            let isEnd = true;
            for (let i = index; i < index + sensitivity; i++) {
                const element = normalizedAudio[i];
                if (element > treshold) {
                    isEnd = false;
                    break;
                }
            }
            if (isEnd) {
                //decalibrator
                //sum*=2

                AudioSums.push(sum);
                break
            } else {
                index++;
            }

        }

    }
    return AudioSums;

}

async function audioToNumbers(audioLink) {
    return await fetch(audioLink)
        .then(response => response.arrayBuffer())
        .then(buffer => {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            return audioContext.decodeAudioData(buffer);
        })
        .then(decodedData => {
            return AudioProcessor(decodedData);
        })
        .catch(error => {
            console.error("Hiba történt az audió feldolgozása során:", error);
        });
}

function loadContentScript(browser, document) {
    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.audioUrl) {
            console.log("Audio URL:", message.audioUrl);
            sendResponse({ status: "received" });
            const fixedUrl = message.audioUrl.replace("CaptchaAudio?identifier=", "CaptchaAudio?valami=1&identifier=");
            audioToNumbers(fixedUrl).then(numbers => {
                var solution = "";
                console.log(numbers);
                numbers.forEach(element => {
                    solution += getClosest(element);
                });
                console.log("Solution:", solution);

                const captchaInput = document.getElementById("captcha-input");
                captchaInput.value = solution;
                const inputEvent = new Event("input", { bubbles: true });
                captchaInput.dispatchEvent(inputEvent);

                document.querySelector("button.captcha-dialog-content__login-button").click();
            }).catch(error => {
                console.error("Error processing audio:", error);
            });
        }
        return true;
    });
}

export {
    name,
    id,
    description,
    options,
    loadContentScript
};