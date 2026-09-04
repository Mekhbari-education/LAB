import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';

export interface EducationalMapItem {
  level: string;
  branch: string;
  groups: number[];
}

export interface Level {
  id: string;
  name: string;
  groups: string[];
}

const MIDDLE_SCHOOL_GROUPS = [
  { level: 'السنة الأولى متوسط', branch: '', groups: [1, 2, 3] },
  { level: 'السنة الثانية متوسط', branch: '', groups: [1, 2, 3] },
  { level: 'السنة الثالثة متوسط', branch: '', groups: [1, 2, 3] },
  { level: 'السنة الرابعة متوسط', branch: '', groups: [1, 2, 3] },
];

const HIGH_SCHOOL_GROUPS = [
  { level: 'السنة الأولى ثانوي', branch: 'جذع مشترك علوم وتكنولوجيا', groups: [1, 2, 3] },
  { level: 'السنة الأولى ثانوي', branch: 'جذع مشترك آداب', groups: [1, 2] },
  { level: 'السنة الثانية ثانوي', branch: 'شعبة الرياضيات', groups: [1] },
  { level: 'السنة الثانية ثانوي', branch: 'شعبة العلوم التجريبية', groups: [1, 2] },
  { level: 'السنة الثانية ثانوي', branch: 'شعبة تقني رياضي (هندسة ميكانيكية)', groups: [1] },
  { level: 'السنة الثانية ثانوي', branch: 'شعبة تقني رياضي (هندسة كهربائية)', groups: [1] },
  { level: 'السنة الثانية ثانوي', branch: 'شعبة تقني رياضي (هندسة مدنية)', groups: [1] },
  { level: 'السنة الثانية ثانوي', branch: 'شعبة تقني رياضي (هندسة الطرائق)', groups: [1] },
  { level: 'السنة الثانية ثانوي', branch: 'شعبة آداب وفلسفة', groups: [1, 2] },
  { level: 'السنة الثانية ثانوي', branch: 'شعبة لغات أجنبية (إسبانية)', groups: [1] },
  { level: 'السنة الثانية ثانوي', branch: 'شعبة لغات أجنبية (ألمانية)', groups: [1] },
  { level: 'السنة الثانية ثانوي', branch: 'شعبة لغات أجنبية (إيطالية)', groups: [1] },
  { level: 'السنة الثالثة ثانوي', branch: 'شعبة الرياضيات', groups: [1] },
  { level: 'السنة الثالثة ثانوي', branch: 'شعبة العلوم التجريبية', groups: [1, 2] },
  { level: 'السنة الثالثة ثانوي', branch: 'شعبة تقني رياضي (هندسة ميكانيكية)', groups: [1] },
  { level: 'السنة الثالثة ثانوي', branch: 'شعبة تقني رياضي (هندسة كهربائية)', groups: [1] },
  { level: 'السنة الثالثة ثانوي', branch: 'شعبة تقني رياضي (هندسة مدنية)', groups: [1] },
  { level: 'السنة الثالثة ثانوي', branch: 'شعبة تقني رياضي (هندسة الطرائق)', groups: [1] },
  { level: 'السنة الثالثة ثانوي', branch: 'شعبة تسيير واقتصاد', groups: [1, 2] },
  { level: 'السنة الثالثة ثانوي', branch: 'شعبة آداب وفلسفة', groups: [1, 2] },
  { level: 'السنة الثالثة ثانوي', branch: 'شعبة لغات أجنبية (إسبانية)', groups: [1] },
  { level: 'السنة الثالثة ثانوي', branch: 'شعبة لغات أجنبية (ألمانية)', groups: [1] },
  { level: 'السنة الثالثة ثانوي', branch: 'شعبة لغات أجنبية (إيطالية)', groups: [1] },
];

export function useEducationalMap() {
  const [levels, setLevels] = useState<Level[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) {
      setIsLoading(false);
      return;
    }

    const docRef = doc(db, 'settings', auth.currentUser.uid);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const cycle = data.cycle || 'ثانوي';
        
        let mapData: EducationalMapItem[] = [];
        if (data.educationalMap && Array.isArray(data.educationalMap) && data.educationalMap.length > 0) {
          mapData = data.educationalMap;
        } else {
          mapData = cycle === 'متوسط' ? MIDDLE_SCHOOL_GROUPS : HIGH_SCHOOL_GROUPS;
        }
        
        // Group by level
        const levelsMap: Record<string, string[]> = {};
        
          mapData.forEach(item => {
            const levelName = item.level;
            if (!levelsMap[levelName]) {
              levelsMap[levelName] = [];
            }
            
            item.groups.forEach(groupNum => {
              let groupLabel = '';
              const formattedGroupNum = groupNum.toString().padStart(2, '0');

              if (cycle === 'متوسط') {
                // Full name for middle school: e.g. "السنة الأولى متوسط فوج 01"
                groupLabel = `${item.level} فوج ${formattedGroupNum}`;
              } else {
                // Map level names
                let levelPrefix = item.level;
                if (item.level === 'السنة الأولى ثانوي') levelPrefix = 'أولى ثانوي';
                else if (item.level === 'السنة الثانية ثانوي') levelPrefix = 'ثانية ثانوي';
                else if (item.level === 'السنة الثالثة ثانوي') levelPrefix = 'ثالثة ثانوي';

                // Clean branch name (remove "شعبة " and parentheses)
                let cleanBranch = item.branch || '';
                cleanBranch = cleanBranch.replace('شعبة ', '');
                cleanBranch = cleanBranch.replace('(', '').replace(')', '');

                groupLabel = `${levelPrefix} ${cleanBranch ? cleanBranch + ' ' : ''}${formattedGroupNum}`;
              }
              levelsMap[levelName].push(groupLabel);
            });
          });
        
        const formattedLevels: Level[] = Object.entries(levelsMap).map(([name, groups]) => ({
          id: name,
          name,
          groups
        }));
        
        setLevels(formattedLevels);
      } else {
        // Handle case where settings doc doesn't exist yet
        const cycle = 'ثانوي';
        const mapData = HIGH_SCHOOL_GROUPS;
        const levelsMap: Record<string, string[]> = {};
        mapData.forEach(item => {
          const levelName = item.level;
          if (!levelsMap[levelName]) levelsMap[levelName] = [];
          item.groups.forEach(groupNum => {
            const formattedGroupNum = groupNum.toString().padStart(2, '0');
            let levelPrefix = item.level;
            if (item.level === 'السنة الأولى ثانوي') levelPrefix = 'أولى ثانوي';
            else if (item.level === 'السنة الثانية ثانوي') levelPrefix = 'ثانية ثانوي';
            else if (item.level === 'السنة الثالثة ثانوي') levelPrefix = 'ثالثة ثانوي';

            let cleanBranch = item.branch || '';
            cleanBranch = cleanBranch.replace('شعبة ', '');
            cleanBranch = cleanBranch.replace('(', '').replace(')', '');

            levelsMap[levelName].push(`${levelPrefix} ${cleanBranch ? cleanBranch + ' ' : ''}${formattedGroupNum}`);
          });
        });
        setLevels(Object.entries(levelsMap).map(([name, groups]) => ({ id: name, name, groups })));
      }
      setIsLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `settings/${auth.currentUser?.uid}`);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { levels, isLoading };
}
