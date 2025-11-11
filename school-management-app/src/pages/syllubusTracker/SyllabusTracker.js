import React, { useState, useEffect } from 'react';
import { Tree, Button, Input, DatePicker } from 'antd';
import { EditOutlined, PlusOutlined } from '@ant-design/icons';
import syllabusData from '../../data/syllabusData.json';
import BackButton from '../../components/BackButton';

const { TreeNode } = Tree;

const SyllabusTracker = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [expandedKeys, setExpandedKeys] = useState([]);
  const [checkedKeys, setCheckedKeys] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ name: '', targetDate: '' });
  const [userRole, setUserRole] = useState('teacher'); // In a real app, this would come from context or props

  useEffect(() => {
    setClasses(syllabusData.classes);
  }, []);

  const handleClassSelect = (classItem) => {
    setSelectedClass(classItem);
    setSelectedSubject(null);
  };

  const handleSubjectSelect = (subject) => {
    setSelectedSubject(subject);
  };

  const handleBack = () => {
    if (selectedSubject) {
      setSelectedSubject(null);
    } else if (selectedClass) {
      setSelectedClass(null);
    } else {
      setSelectedClass(null);
      setSelectedSubject(null);
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (date, dateString) => {
    setEditData(prev => ({
      ...prev,
      targetDate: dateString
    }));
  };

  const handleSaveEdit = (item, type) => {
    // In a real app, this would update the JSON file or make an API call
    console.log(`Saving ${type} edit:`, item, editData);
    setIsEditing(false);
    setEditData({ name: '', targetDate: '' });
  };

  const onExpand = (expandedKeysValue) => {
    setExpandedKeys(expandedKeysValue);
  };

  const onCheck = (checkedKeysValue) => {
    setCheckedKeys(checkedKeysValue);
  };

  const renderTreeNodes = (data) => {
    return data.map(item => {
      if (item.topics) {
        // Chapter node with target date
        return (
          <TreeNode 
            title={
              <div className="tree-node">
                <span>{item.name}</span>
                <span className="target-date-tree">Target: {item.targetDate}</span>
              </div>
            } 
            key={item.id} 
            dataRef={item}
          >
            {item.topics.map(topic => (
              <TreeNode title={topic.name} key={topic.id} dataRef={topic} />
            ))}
          </TreeNode>
        );
      } else {
        // Topic node
        return <TreeNode title={item.name} key={item.id} dataRef={item} />;
      }
    });
  };

  // Render class selection view
  if (!selectedClass) {
    return (
      <div className="container">
        <BackButton/>
        <div className="header">
          <h2>Syllabus Tracker</h2>
          {userRole === 'chairman' && (
            <Button 
              type="primary" 
              icon={<EditOutlined />}
              onClick={handleEditToggle}
              className="syllabus-edit-btn"
            >
              {isEditing ? 'Cancel Edit' : 'Edit Syllabus'}
            </Button>
          )}
        </div>
        <p>Select a class to view its subjects and track progress</p>
        
        <div className="class-list">
          <h3>Classes</h3>
          <div className="grid-container">
            {classes.map(classItem => (
              <div 
                key={classItem.id} 
                className="class-item card"
                onClick={() => handleClassSelect(classItem)}
              >
                <h4>{classItem.name}</h4>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Render subject selection view
  if (!selectedSubject) {
    return (
      <div className="container">
      <div className="navigation-header">
        {/* Back button to go back to class list */}
        <BackButton
        text="← Back to Classes"
        onClick={handleBack}   // use handleBack instead of a `to` prop
      />
        <h2>{selectedClass.name}</h2>
        {userRole === 'chairman' && (
          <Button 
            type="primary" 
            icon={<EditOutlined />}
            onClick={handleEditToggle}
            className="syllabus-edit-btn"
          >
            {isEditing ? 'Cancel Edit' : 'Edit Syllabus'}
          </Button>
        )}
      </div>
        
        <div className="subject-list">
          <h3>Subjects</h3>
          <div className="grid-container">
            {selectedClass.subjects.map(subject => (
              <div 
                key={subject.id} 
                className="subject-item card"
                onClick={() => handleSubjectSelect(subject)}
              >
                <h4>{subject.name}</h4>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Render chapter view with tree
  return (
    <div className="container">
      <div className="navigation-header">
        {/* Back button to go back to subject selection */}
        <BackButton 
          text="← Back to Subjects" 
          onClick={handleBack} 
        />
        <h2>{selectedClass.name} - {selectedSubject.name}</h2>
        {userRole === 'chairman' && (
          <Button 
            type="primary" 
            icon={<EditOutlined />}
            onClick={handleEditToggle}
            className="syllabus-edit-btn"
          >
            {isEditing ? 'Cancel Edit' : 'Edit Chapters'}
          </Button>
        )}
      </div>
      
      <div className="tree-container">
        <Tree
          className="chapter-tree"
          // checkable
          showLine={{ showLeafIcon: false }}
          expandedKeys={expandedKeys}
          onExpand={onExpand}
          checkedKeys={checkedKeys}
          onCheck={onCheck}
          defaultExpandAll={true}
          blockNode={true}
        >
          {renderTreeNodes(selectedSubject.chapters)}
        </Tree>
      </div>
      
      {isEditing && userRole === 'chairman' && (
        <div className="edit-form">
          <h3>Add New Chapter</h3>
          <Input
            name="name"
            placeholder="Chapter name"
            value={editData.name}
            onChange={handleEditChange}
            style={{ marginBottom: 15 }}
          />
          <DatePicker 
            placeholder="Target date" 
            onChange={handleDateChange}
            style={{ width: '100%', marginBottom: 15 }}
          />
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => handleSaveEdit(selectedSubject, 'chapter')}
          >
            Add Chapter
          </Button>
        </div>
      )}
    </div>
  );
};

export default SyllabusTracker;
