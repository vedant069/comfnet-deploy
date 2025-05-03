"use client";

import { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Loader2, ExternalLink, User, Users, Briefcase, Map, Search } from "lucide-react";
import { Badge } from "./ui/badge";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";

interface Candidate {
  profile_url: string;
  title: string;
  snippet: string;
  job_type: string;
  location: string;
  found_at: string;
}

export default function CandidateSearch() {
  const [jobType, setJobType] = useState("");
  const [location, setLocation] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Candidate[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [onlyShowOpenToWork, setOnlyShowOpenToWork] = useState(true);
  
  const handleSearch = async () => {
    if (!jobType.trim() || !location.trim()) {
      setError("Please enter both job type and location");
      return;
    }
    
    setIsSearching(true);
    setError(null);
    
    try {
      const response = await fetch(`https://comfnet-fastapi-production.up.railway.app/api/candidates/search?job_type=${encodeURIComponent(jobType)}&location=${encodeURIComponent(location)}`);
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }
      
      const data = await response.json();
      setSearchResults(data.candidates || []);
      
      if (data.candidates?.length === 0) {
        setError("No candidates found. Try different search terms or location");
      }
    } catch (err) {
      console.error("Error searching for candidates:", err);
      setError(err instanceof Error ? err.message : "Failed to search for candidates");
    } finally {
      setIsSearching(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
          Candidate Search
        </h2>
        <p className="text-muted-foreground">
          Find potential candidates for your job openings on LinkedIn
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Search Parameters</CardTitle>
          <CardDescription>
            Enter the job type and location to find candidates who match your criteria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="jobType">Job Type or Skill</Label>
              <Input
                id="jobType"
                placeholder="e.g., 'SQL Developer', 'Data Scientist'"
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="e.g., 'India', 'Bangalore', 'Remote'"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2 mt-4">
            <Switch
              id="open-to-work"
              checked={onlyShowOpenToWork}
              onCheckedChange={setOnlyShowOpenToWork}
            />
            <Label htmlFor="open-to-work">Only show people open to work</Label>
          </div>
          
          <Button 
            className="w-full mt-4" 
            onClick={handleSearch}
            disabled={isSearching || !jobType.trim() || !location.trim()}
          >
            {isSearching ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Find Candidates
              </>
            )}
          </Button>
          
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-md mt-4 text-sm">
              {error}
            </div>
          )}
        </CardContent>
      </Card>
      
      {searchResults.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">
              Found {searchResults.length} Candidates
            </h3>
            <Badge variant="outline" className="font-normal">
              {jobType} • {location}
            </Badge>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {searchResults.map((candidate, index) => (
              <Card key={index} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">{candidate.title}</h4>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                        {candidate.snippet}
                      </p>
                    </div>
                    
                    <div className="mt-3 flex items-center text-xs text-gray-500">
                      <Map className="h-3 w-3 mr-1" />
                      {candidate.location}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="p-4 flex justify-between items-center bg-gray-50 dark:bg-gray-800">
                    <Badge variant="outline">LinkedIn Profile</Badge>
                    <Button 
                      size="sm" 
                      onClick={() => window.open(candidate.profile_url, "_blank")}
                      className="flex items-center gap-1"
                    >
                      View Profile
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
