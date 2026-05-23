-- SmartDraw AI Designer - Database Schema

CREATE DATABASE IF NOT EXISTS smartdraw CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE smartdraw;

-- Users table
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  avatar_url VARCHAR(500) DEFAULT NULL,
  display_name VARCHAR(100) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP NULL,
  INDEX idx_email (email),
  INDEX idx_username (username)
) ENGINE=InnoDB;

-- Projects (collection of diagrams)
CREATE TABLE projects (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT DEFAULT NULL,
  thumbnail_url VARCHAR(500) DEFAULT NULL,
  is_archived BOOLEAN DEFAULT FALSE,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_updated (updated_at)
) ENGINE=InnoDB;

-- Diagrams (each project has multiple diagrams)
CREATE TABLE diagrams (
  id VARCHAR(36) PRIMARY KEY,
  project_id VARCHAR(36) NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT DEFAULT NULL,
  diagram_type ENUM('flowchart','er','uml','mindmap','network','bpmn','custom') DEFAULT 'flowchart',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  INDEX idx_project_id (project_id)
) ENGINE=InnoDB;

-- Diagram pages (multi-page support)
CREATE TABLE diagram_pages (
  id VARCHAR(36) PRIMARY KEY,
  diagram_id VARCHAR(36) NOT NULL,
  name VARCHAR(200) NOT NULL DEFAULT 'Page 1',
  page_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  viewport JSON DEFAULT NULL COMMENT '{x, y, zoom}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (diagram_id) REFERENCES diagrams(id) ON DELETE CASCADE,
  INDEX idx_diagram_id (diagram_id)
) ENGINE=InnoDB;

-- Diagram nodes
CREATE TABLE diagram_nodes (
  id VARCHAR(36) PRIMARY KEY,
  page_id VARCHAR(36) NOT NULL,
  node_type VARCHAR(50) NOT NULL DEFAULT 'rectangle',
  label TEXT DEFAULT NULL,
  position_x DOUBLE NOT NULL DEFAULT 0,
  position_y DOUBLE NOT NULL DEFAULT 0,
  width DOUBLE NOT NULL DEFAULT 120,
  height DOUBLE NOT NULL DEFAULT 60,
  style JSON DEFAULT NULL COMMENT '{fill,stroke,strokeWidth,opacity,borderRadius,fontSize,fontFamily,shadow}',
  z_index INT DEFAULT 0,
  is_locked BOOLEAN DEFAULT FALSE,
  is_hidden BOOLEAN DEFAULT FALSE,
  group_id VARCHAR(36) DEFAULT NULL,
  data JSON DEFAULT NULL COMMENT 'extra data for custom nodes',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (page_id) REFERENCES diagram_pages(id) ON DELETE CASCADE,
  INDEX idx_page_id (page_id),
  INDEX idx_group (group_id)
) ENGINE=InnoDB;

-- Diagram edges (connections)
CREATE TABLE diagram_edges (
  id VARCHAR(36) PRIMARY KEY,
  page_id VARCHAR(36) NOT NULL,
  source_node_id VARCHAR(36) NOT NULL,
  target_node_id VARCHAR(36) NOT NULL,
  edge_type ENUM('straight','bezier','step','smooth') DEFAULT 'bezier',
  source_handle VARCHAR(20) DEFAULT NULL,
  target_handle VARCHAR(20) DEFAULT NULL,
  label TEXT DEFAULT NULL,
  style JSON DEFAULT NULL COMMENT '{stroke,strokeWidth,animated,arrowStart,arrowEnd,lineStyle}',
  z_index INT DEFAULT 0,
  data JSON DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (page_id) REFERENCES diagram_pages(id) ON DELETE CASCADE,
  FOREIGN KEY (source_node_id) REFERENCES diagram_nodes(id) ON DELETE CASCADE,
  FOREIGN KEY (target_node_id) REFERENCES diagram_nodes(id) ON DELETE CASCADE,
  INDEX idx_page_id (page_id),
  INDEX idx_source (source_node_id),
  INDEX idx_target (target_node_id)
) ENGINE=InnoDB;

-- Operation history for undo/redo
CREATE TABLE operation_history (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  page_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) DEFAULT NULL,
  operation_type VARCHAR(50) NOT NULL COMMENT 'node_add,node_move,node_delete,node_update,edge_add,edge_delete,edge_update,batch',
  operation_data JSON NOT NULL COMMENT 'full snapshot of affected items',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (page_id) REFERENCES diagram_pages(id) ON DELETE CASCADE,
  INDEX idx_page_time (page_id, created_at DESC)
) ENGINE=InnoDB;

-- User settings
CREATE TABLE user_settings (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL UNIQUE,
  theme ENUM('dark','light') DEFAULT 'dark',
  language VARCHAR(10) DEFAULT 'zh-CN',
  grid_enabled BOOLEAN DEFAULT TRUE,
  snap_enabled BOOLEAN DEFAULT TRUE,
  auto_save_interval INT DEFAULT 30 COMMENT 'seconds',
  default_font VARCHAR(100) DEFAULT 'Arial',
  default_font_size INT DEFAULT 14,
  editor_preferences JSON DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Collaboration sessions (for real-time sync)
CREATE TABLE collaboration_sessions (
  id VARCHAR(36) PRIMARY KEY,
  diagram_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  socket_id VARCHAR(100) DEFAULT NULL,
  cursor_position JSON DEFAULT NULL COMMENT '{x, y, page_id}',
  is_active BOOLEAN DEFAULT TRUE,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  left_at TIMESTAMP NULL,
  FOREIGN KEY (diagram_id) REFERENCES diagrams(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_diagram_active (diagram_id, is_active)
) ENGINE=InnoDB;

-- Shorthand: insert into collaboration_sessions
CREATE TABLE shape_templates (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) DEFAULT NULL COMMENT 'NULL = system template',
  category VARCHAR(50) NOT NULL,
  name VARCHAR(100) NOT NULL,
  shape_data JSON NOT NULL,
  icon VARCHAR(50) DEFAULT NULL,
  is_public BOOLEAN DEFAULT FALSE,
  usage_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_category (category)
) ENGINE=InnoDB;
