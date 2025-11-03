'use client';

import { useState } from 'react';
import { Button } from '@repo/ui/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/components/ui/card';
import { useInstantData } from './useInstantData';
import { useSeedData } from './useSeedData';

export function SevisDataAnalyzer() {
  const [analysis, setAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const runAnalysis = () => {
    setIsAnalyzing(true);
    
    try {
      const instantData = useInstantData();
      
      if (instantData.error) {
        console.log('Using fallback data due to InstantDB error:', instantData.error);
        const seedData = useSeedData();
        const results = analyzeData(seedData, 'Fallback Seed Data');
        setAnalysis(results);
      } else {
        console.log('Using InstantDB data');
        const results = analyzeData(instantData, 'InstantDB Data');
        setAnalysis(results);
      }
    } catch (error) {
      console.error('Analysis error:', error);
      const seedData = useSeedData();
      const results = analyzeData(seedData, 'Fallback Seed Data (Error)');
      setAnalysis(results);
    } finally {
      setIsAnalyzing(false);
    }
  };

  function analyzeData(data: any, sourceName: string) {
    const results = {
      sourceName,
      totalProfiles: data.profiles?.length || 0,
      totalRelationships: data.relationships?.length || 0,
      studentProfiles: 0,
      source1Count: 0,
      source2Count: 0,
      source3Count: 0,
      finalTypes: new Map<string, number>(),
      sampleProfileData: null,
      sampleRelationshipData: null
    };

    if (!data.profiles || data.profiles.length === 0) {
      return results;
    }

    // Count student profiles
    const studentProfiles = data.profiles.filter((p: any) => p.type === 'student');
    results.studentProfiles = studentProfiles.length;

    if (studentProfiles.length === 0) {
      return results;
    }

    // Analyze sources
    results.source1Count = studentProfiles.filter((p: any) => p.data?.sevis_processing_type).length;
    results.source2Count = studentProfiles.filter((p: any) => p.data?.changeType).length;
    
    const relationships = data.relationships || [];
    results.source3Count = relationships.filter((r: any) => r.data?.sevis_processing_type).length;

    // Sample data
    if (studentProfiles.length > 0) {
      results.sampleProfileData = studentProfiles[0].data;
    }
    if (relationships.length > 0) {
      results.sampleRelationshipData = relationships[0].data;
    }

    // Calculate final types
    studentProfiles.forEach((profile: any) => {
      let type = 'New Student'; // Default
      
      // Apply UI logic
      if (profile.data?.sevis_processing_type) {
        type = String(profile.data.sevis_processing_type);
      } else if (profile.data?.changeType) {
        type = String(profile.data.changeType);
      } else {
        // Check relationships
        const studentRelationships = relationships.filter((r: any) => r.secondaryId === profile.id);
        const orgRelationship = studentRelationships.find((r: any) => r.type === 'sending_org_student');
        if (orgRelationship?.data?.sevis_processing_type) {
          type = String(orgRelationship.data.sevis_processing_type);
        }
      }

      // Validate
      const validTypes = [
        'New Student', 'Validation - Housing', 'Validation - Site of Activity', 'Payment',
        'Bio', 'Update - Housing', 'Update - Site of Activity', 'Program Date',
        'Program Extension', 'Program Shorten', 'Reprint', 'Status End',
        'Status Invalid', 'Status Terminate', 'Update - Edit Subject', 'Financial Info'
      ];

      if (!validTypes.includes(type)) {
        type = 'New Student';
      }

      results.finalTypes.set(type, (results.finalTypes.get(type) || 0) + 1);
    });

    return results;
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>SEVIS Type Data Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={runAnalysis} 
          disabled={isAnalyzing}
          className="mb-4"
        >
          {isAnalyzing ? 'Analyzing...' : 'Run Analysis'}
        </Button>

        {analysis && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Data Source:</strong> {analysis.sourceName}
              </div>
              <div>
                <strong>Total Profiles:</strong> {analysis.totalProfiles}
              </div>
              <div>
                <strong>Student Profiles:</strong> {analysis.studentProfiles}
              </div>
              <div>
                <strong>Total Relationships:</strong> {analysis.totalRelationships}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">SEVIS Type Data Sources:</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <strong>Source 1:</strong> {analysis.source1Count} records<br/>
                  <span className="text-gray-500">(profile.data.sevis_processing_type)</span>
                </div>
                <div>
                  <strong>Source 2:</strong> {analysis.source2Count} records<br/>
                  <span className="text-gray-500">(profile.data.changeType)</span>
                </div>
                <div>
                  <strong>Source 3:</strong> {analysis.source3Count} records<br/>
                  <span className="text-gray-500">(relationship.data.sevis_processing_type)</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Final Type Distribution:</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {Array.from(analysis.finalTypes.entries()).map((entry: any) => {
                  const type = entry[0] as string;
                  const count = entry[1] as number;
                  const percentage = ((count / analysis.studentProfiles) * 100).toFixed(1);
                  return (
                    <div key={type} className="flex justify-between">
                      <span>"{type}":</span>
                      <span>{count} records ({percentage}%)</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {analysis.sampleProfileData && (
              <div>
                <h4 className="font-medium mb-2">Sample Profile Data:</h4>
                <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                  {JSON.stringify(analysis.sampleProfileData, null, 2)}
                </pre>
              </div>
            )}

            {analysis.sampleRelationshipData && (
              <div>
                <h4 className="font-medium mb-2">Sample Relationship Data:</h4>
                <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                  {JSON.stringify(analysis.sampleRelationshipData, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 