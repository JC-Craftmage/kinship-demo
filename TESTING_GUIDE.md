# Testing the Refactored Directory

## 🧪 Quick Test Checklist

### URLs to Visit:
- ✅ **Old version:** http://localhost:3000 (click "View Demo" → "Directory" tab)
- ✅ **New version:** http://localhost:3000/directory

Both should look and work identically!

---

## What Each File Does:

### 1. **data/members.ts** (The Data)
```typescript
export const members = [
  { id: 2, name: 'Mike Chen', kudos: 67, ... },
  { id: 1, name: 'Sarah Johnson', kudos: 45, ... },
  // ... 6 more members
];
```
**Job:** Store member information
**Old location:** Mixed into app/page.tsx lines 14-154
**Benefit:** Easy to find and edit member data

---

### 2. **components/features/directory/member-card.tsx** (The Card)
```typescript
export function MemberCard({ member, onSelect }) {
  return (
    <Card hover onClick={() => onSelect(member)}>
      <div className="flex gap-4">
        <div className="text-5xl">{member.avatar}</div>
        <h3>{member.name}</h3>
        {member.kudos >= 50 && <Badge variant="kudos">...</Badge>}
      </div>
    </Card>
  );
}
```
**Job:** Display one member in the list
**Old location:** Embedded in DirectoryPage component
**Benefit:** Reusable, testable, clean

---

### 3. **components/features/directory/member-modal.tsx** (The Popup)
```typescript
export function MemberModal({ member, onClose }) {
  return (
    <Modal isOpen={!!member} onClose={onClose}>
      {/* Member details here */}
    </Modal>
  );
}
```
**Job:** Show member details when you click a card
**Old location:** app/page.tsx lines 642-819
**Benefit:** Isolated, easy to modify

---

### 4. **app/(dashboard)/directory/page.tsx** (The Page)
```typescript
export default function DirectoryPage() {
  const { filteredMembers } = useMembers();
  const [selectedMember, setSelectedMember] = useState(null);

  return (
    <div>
      {filteredMembers.map(member => (
        <MemberCard member={member} onSelect={setSelectedMember} />
      ))}
      <MemberModal member={selectedMember} onClose={...} />
    </div>
  );
}
```
**Job:** Put everything together
**Old location:** app/page.tsx lines 435-507
**Benefit:** Super clean, easy to understand

---

### 5. **hooks/use-members.ts** (The Logic)
```typescript
export function useMembers() {
  const [members] = useState(mockMembers);
  const [campusFilter, setCampusFilter] = useState('all');

  const filteredMembers = useMemo(() => {
    if (campusFilter === 'all') return members;
    return members.filter(m => m.campus === campusFilter);
  }, [members, campusFilter]);

  return { filteredMembers, setCampusFilter, ... };
}
```
**Job:** Manage filtering, sorting, state
**Old location:** Mixed into page component
**Benefit:** Reusable across multiple pages

---

## 🎯 Test Scenarios:

### Scenario 1: Click on Mike Chen
**Expected:**
1. Modal opens
2. Shows "Mike Chen" with 👨 avatar
3. Shows 67 kudos badge
4. Shows "Master Carpenter" job title
5. Shows 3 assets (truck, tractor, excavator)
6. Shows skills: Carpenter, Home Repair, Woodworking

### Scenario 2: Click on Rachel Kim
**Expected:**
1. Modal opens
2. Shows "💼 Seeking Work" badge (orange)
3. Shows "👥 Looking to Join Groups" badge (purple)
4. Lists: Young Adults, Tech Professionals, Career Support
5. Shows "Recently laid off" for company

### Scenario 3: Click on Robert Chen
**Expected:**
1. Modal opens
2. Shows HUGE kudos badge (156 - highest!)
3. Banner says "Church Family Hero!"
4. Shows "Retired High School Principal"
5. No assets listed

---

## 🔍 Code Comparison:

### To Change Mike's Kudos from 67 → 100:

**Old Way:**
1. Open app/page.tsx (1,565 lines)
2. Scroll to line ~16
3. Find Mike in the array
4. Change kudos: 67 to kudos: 100
5. Save

**New Way:**
1. Open data/members.ts (123 lines)
2. Find Mike (line ~4)
3. Change kudos: 67 to kudos: 100
4. Save

**Result:** Both work the same, new way is faster to find!

---

## ✅ Success Criteria:

You'll know it's working when:
- ✓ Both URLs show identical member directory
- ✓ All 8 members appear
- ✓ Clicking members opens modals
- ✓ Badges show correctly (kudos, seeking work, etc.)
- ✓ Assets display for members who have them
- ✓ No console errors

---

## 🐛 Common Issues:

**If you see errors:**
1. Check the browser console (F12)
2. Look for TypeScript errors in terminal
3. Make sure dev server is running (npm run dev)

**If directory is blank:**
1. Check that data/members.ts exports correctly
2. Verify imports use @/ prefix
3. Check terminal for build errors
