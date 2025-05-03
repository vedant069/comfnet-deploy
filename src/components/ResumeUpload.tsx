import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileUp, ChevronLeft, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { parseResume, ResumeData, updatePreferredLocation } from "@/services/resume-service";

interface ResumeUploadProps {
  onBack: () => void;
  onComplete: () => void;
  resumeData: ResumeData | null;
  setResumeData: (data: ResumeData | null) => void;
  setResumeUploaded: (uploaded: boolean) => void;
  preferredLocation: string;
  setPreferredLocation: (location: string) => void;
}

export default function ResumeUpload({
  onBack,
  onComplete,
  resumeData,
  setResumeData,
  setResumeUploaded,
  preferredLocation,
  setPreferredLocation
}: ResumeUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [networkError, setNetworkError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      console.log("File selected:", selectedFile.name);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      setFile(droppedFile);
      console.log("File dropped:", droppedFile.name);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setUploadError("Please select a file first");
      return;
    }

    setUploading(true);
    setUploadError(null);
    setNetworkError(false);

    try {
      console.log("Starting file upload for:", file.name);
      const data = await parseResume(file);
      console.log("Parsed resume data:", data);
      setResumeData(data);
      setUploadSuccess(true);
      setResumeUploaded(true);
    } catch (err: any) {
      console.error("Upload error:", err);

      if (
        err.message === "Failed to fetch" ||
        err.message?.includes("NetworkError") ||
        err.message?.includes("CORS")
      ) {
        setNetworkError(true);
        setUploadError("Network error: The resume parsing service is currently unavailable. Please try again later.");
      } else {
        setUploadError(err.message || "Upload failed");
      }
    } finally {
      setUploading(false);
    }
  };

  const handleContinueToDashboard = async () => {
    if (preferredLocation) {
      try {
        await updatePreferredLocation(preferredLocation);
      } catch (error) {
        console.error("Error updating preferred location:", error);
      }
    }

    onComplete();
  };

  return (
    <div>
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mr-2"
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
          Upload Your Resume
        </h2>
      </div>
      {resumeData && uploadSuccess ? (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">
            Parsed Resume Data
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p>
                    <span className="font-semibold">Name:</span>{" "}
                    {resumeData.basic_info.name}
                  </p>
                  <p>
                    <span className="font-semibold">Email:</span>{" "}
                    {resumeData.basic_info.email}
                  </p>
                  <p>
                    <span className="font-semibold">Phone:</span>{" "}
                    {resumeData.basic_info.phone}
                  </p>
                  <p>
                    <span className="font-semibold">Location:</span>{" "}
                    {resumeData.basic_info.location}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">
                      Technical Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {resumeData.technical_skills.map(
                        (skill, index) => (
                          <Badge key={index} variant="secondary">
                            {skill}
                          </Badge>
                        )
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Soft Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {resumeData.soft_skills.map((skill, index) => (
                        <Badge key={index} variant="outline">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Experience</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {resumeData.experience.map((exp, index) => (
                    <div
                      key={index}
                      className="border-b pb-4 last:border-0"
                    >
                      <h3 className="font-bold">{exp.job_title}</h3>
                      <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                        <p>{exp.company}</p>
                        <p>{exp.duration}</p>
                      </div>
                      <p className="mt-2">{exp.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Education</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {resumeData.education.map((edu, index) => (
                    <div
                      key={index}
                      className="border-b pb-4 last:border-0"
                    >
                      <h3 className="font-bold">{edu.degree}</h3>
                      <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                        <p>{edu.institution}</p>
                        <p>{edu.year}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Certifications</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-1">
                  {resumeData.certifications.map((cert, index) => (
                    <li key={index}>{cert}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
          <div className="mt-6 flex justify-end gap-4">
            <Button
              variant="outline"
              onClick={() => {
                setResumeData(null);
                setFile(null);
                setUploadSuccess(false);
              }}
            >
              Upload Another Resume
            </Button>
            <Button
              onClick={handleContinueToDashboard}
            >
              Continue to Dashboard
            </Button>
          </div>
        </div>
      ) : (
        <div
          className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 flex flex-col items-center justify-center"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <FileUp className="h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-600 dark:text-gray-300 mb-4 text-center">
            Drag and drop your resume file here, or click to browse
          </p>
          <input
            type="file"
            id="resumeUpload"
            className="hidden"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
            ref={fileInputRef}
          />
          <Button
            type="button"
            className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            Browse Files
          </Button>
          {file && (
            <p className="text-green-600 dark:text-green-400 mt-2">
              Selected: {file.name}
            </p>
          )}
          {uploadError && (
            <div className="text-red-600 dark:text-red-400 mt-2 flex items-center gap-2">
              {networkError && <AlertTriangle className="h-4 w-4" />}
              <p>Error: {uploadError}</p>
            </div>
          )}
          {networkError && (
            <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md text-sm">
              <p className="font-medium mb-1">Server Connection Issue</p>
              <p>Our resume parsing service is currently experiencing issues. This could be due to:</p>
              <ul className="list-disc pl-5 mt-1">
                <li>Server maintenance</li>
                <li>Network connectivity problems</li>
                <li>Cross-origin resource sharing restrictions</li>
              </ul>
              <p className="mt-1">The development team has been notified. Please try again later.</p>
            </div>
          )}
          {!uploadSuccess && (
            <Button 
              onClick={handleUpload} 
              className="mt-4"
              disabled={!file || uploading}
            >
              {uploading ? 'Uploading...' : 'Upload Resume'}
            </Button>
          )}
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
            Supported formats: PDF, DOC, DOCX
          </p>
        </div>
      )}
    </div>
  );
}
