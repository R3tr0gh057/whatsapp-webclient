"use client";
import { useState } from "react";
import Image from "next/image";
import fileEdit from "../assets/File-edit.png";
import excel from "../assets/Excel.png";
import { makeRequest } from "../../utils/RestHelper.js";

interface Template {
  name: string;
  language: { code: string; policy: string };
  namespace: string;
}

interface ComponentData {
  key: string;
  type: string;
  value: string;
}

function parseCurlPayload(
  curlString: string
): { key: string; type: string; value: string }[] | null {
  try {
    // Extract JSON from cURL command
    const jsonMatch = curlString.match(/--data-raw '({[\s\S]*})'/);
    if (!jsonMatch || !jsonMatch[1]) return null;

    // Parse JSON safely
    const payload = JSON.parse(jsonMatch[1]);
    const components =
      payload?.payload?.template?.to_and_components?.[0]?.components || {};

    // Convert components to expected format
    return Object.entries(components).map(([key, value]) => ({
      key,
      type: (value as { type: string }).type || "text",
      value: "",
    }));
  } catch (error) {
    console.error("Error parsing cURL payload:", error);
    return null;
  }
}

async function sendWhatsappMessage({
  phoneNumbers,
  template,
  formData,
}: {
  phoneNumbers: string[];
  template: Template;
  formData: ComponentData[];
}) {
  const requestData = {
    integrated_number: "919740058897",
    content_type: "template",
    payload: {
      messaging_product: "whatsapp",
      type: "template",
      template: {
        name: template.name,
        language: template.language,
        namespace: template.namespace,
        to_and_components: [
          {
            to: phoneNumbers,
            components: Object.fromEntries(
              formData.map(({ key, value }) => [key, { type: "text", value }])
            ),
          },
        ],
      },
    },
  };

  try {
    const response = await fetch("/api/proxy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestData),
    });
    return await response.json();
  } catch (error) {
    console.error("Error sending message:", error);
  }
}

export default function WhatsappSender() {
  const [manualEntry, setManualEntry] = useState(false);
  const [curlInput, setCurlInput] = useState("");
  const [components, setComponents] = useState<
    { key: string; type: string; value: string }[]
  >([]);
  const [phoneNumbers, setPhoneNumbers] = useState("");

  const handleParseCurl = () => {
    const extractedComponents = parseCurlPayload(curlInput);
    if (extractedComponents) setComponents(extractedComponents);
  };

  const handleClear = () => {
    setCurlInput("");
    setComponents([]);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 p-6 text-gray-700">
      <h1 className="text-xl font-semibold mb-4">Send Whatsapp Message</h1>

      <div className="flex flex-1 gap-6">
        {/* Left Section - Selection Cards */}
        <div className="flex flex-col gap-4 w-2/3">
          <div className="flex gap-4">
            <div
              className={`p-6 bg-white shadow-lg rounded-2xl flex items-center gap-2 cursor-pointer ${
                manualEntry ? "ring-2 ring-blue-500" : ""
              }`}
              onClick={() => setManualEntry(true)}
            >
              <Image src={fileEdit} alt="CSV File" width={32} height={32} />
              <span>Enter Manually</span>
            </div>
            <div
              className={`p-6 bg-white shadow-lg rounded-2xl flex items-center gap-2 cursor-pointer ${
                !manualEntry ? "ring-2 ring-blue-500" : ""
              }`}
              onClick={() => setManualEntry(false)}
            >
              <Image src={excel} alt="CSV File" width={32} height={32} />
              <span>CSV File</span>
            </div>
          </div>

          {manualEntry && (
            <div className="bg-white p-4 rounded-2xl shadow-lg">
              <label className="block font-medium">Mobile Numbers *</label>
              <textarea
                className="w-full p-2 border rounded-lg mt-2"
                placeholder="Enter mobile numbers here..."
                rows={4}
                value={phoneNumbers}
                onChange={(e) => setPhoneNumbers(e.target.value)}
              ></textarea>
              <p className="text-sm text-gray-500">
                Enter comma-separated mobile numbers with country code excluding
                the "+" sign.
              </p>

              <label className="block font-medium mt-4">
                Paste cURL Command
              </label>

              <textarea
                className="w-full p-2 border rounded-lg mt-2"
                placeholder="Paste your cURL request here..."
                rows={6}
                value={curlInput}
                onChange={(e) => setCurlInput(e.target.value)}
              ></textarea>
              <button
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg"
                onClick={handleParseCurl}
              >
                Parse cURL
              </button>
              <button
                className="mt-2 px-4 py-2 ml-2 bg-gray-400 text-white rounded-lg"
                onClick={handleClear}
              >
                Clear
              </button>

              {components.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-medium">Generated Inputs:</h3>
                  {components.map((comp, index) => (
                    <input
                      key={index}
                      type="text"
                      placeholder={comp.key}
                      className="w-full p-2 border rounded-lg mt-2"
                      onChange={(e) => {
                        const newComponents = [...components];
                        newComponents[index].value = e.target.value;
                        setComponents(newComponents);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Section - Template Preview */}
        <div className="w-1/3 bg-gray-50 rounded-2xl p-4 shadow-inner">
          <h2 className="text-lg font-medium">Template Preview</h2>
          <div className="border-t mt-2"></div>
        </div>
      </div>

      {/* Bottom Buttons */}
      <div className="flex justify-end gap-4 mt-6">
        <button className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg">
          Cancel
        </button>
        <button
          className="px-6 py-2 bg-blue-500 text-white rounded-lg"
          onClick={() =>
            sendWhatsappMessage({
              phoneNumbers: phoneNumbers.split(","),
              template: {
                name: "general_notification",
                language: { code: "en", policy: "deterministic" },
                namespace: "dc7b7d3e_452f_4b27_ad30_c7110cebd6b6",
              },
              formData: components,
            })
          }
        >
          Review & Send
        </button>
      </div>
    </div>
  );
}
