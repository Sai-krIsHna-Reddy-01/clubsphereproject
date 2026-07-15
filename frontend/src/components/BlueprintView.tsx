import React, { useState } from "react";
import { FolderOpen, Database, FileCode, ShieldCheck, Server, Sparkles } from "lucide-react";

export const BlueprintView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"structure" | "database" | "springboot">("structure");

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="font-display font-bold text-xl text-white">System Architecture Blueprints</h2>
        <p className="text-xs text-slate-400">Technical specifications, directory structure trees, JPA models, and MySQL ERD relational constraints.</p>
      </div>

      {/* Tabs header */}
      <div className="flex border-b border-slate-800">
        <button
          onClick={() => setActiveTab("structure")}
          className={`pb-4 px-6 font-display font-medium text-xs transition-colors border-b-2 ${
            activeTab === 'structure' ? 'border-indigo-500 text-white' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4" />
            Directory Tree Blueprint
          </div>
        </button>
        <button
          onClick={() => setActiveTab("database")}
          className={`pb-4 px-6 font-display font-medium text-xs transition-colors border-b-2 ${
            activeTab === 'database' ? 'border-indigo-500 text-white' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            MySQL Relational ERD
          </div>
        </button>
        <button
          onClick={() => setActiveTab("springboot")}
          className={`pb-4 px-6 font-display font-medium text-xs transition-colors border-b-2 ${
            activeTab === 'springboot' ? 'border-indigo-500 text-white' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            <FileCode className="h-4 w-4" />
            Spring Boot Configurations
          </div>
        </button>
      </div>

      {/* TAB 1: FOLDER STRUCTURE */}
      {activeTab === "structure" && (
        <div className="bg-[#16191f] border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-display font-bold text-white text-base">Production Directory Tree</h3>
              <p className="text-xs text-slate-400 mt-0.5">High-fidelity blueprint of standard enterprise-scale Monorepo architecture.</p>
            </div>
            <span className="text-[10px] bg-[#090a0c] text-slate-400 font-mono border border-slate-800 px-2 py-1 rounded-md">Enterprise Ready</span>
          </div>

          <div className="font-mono text-xs bg-[#090a0c] p-5 rounded-xl border border-slate-800/60 overflow-x-auto space-y-2 text-slate-300 select-all">
            <p className="text-slate-500">// Project Root Layout</p>
            <p className="text-indigo-400">📁 ClubSphere/</p>
            <p className="pl-4 text-emerald-400">├── 📁 backend/ <span className="text-slate-600">// Standard Java Maven Core</span></p>
            <p className="pl-8 text-slate-400">├── 📁 src/main/java/com/clubsphere/</p>
            <p className="pl-12 text-slate-500">├── 📁 config/ <span className="text-slate-600">-- Spring MVC & CORS Filters</span></p>
            <p className="pl-12 text-slate-500">├── 📁 security/ <span className="text-slate-600">-- Spring Security & JWT Filters</span></p>
            <p className="pl-12 text-slate-400">├── 📁 controllers/ <span className="text-slate-600">-- REST Endpoints (Auth, Clubs, Events)</span></p>
            <p className="pl-12 text-slate-400">├── 📁 models/ <span className="text-slate-600">-- JPA entities (User, Club, Member, Event)</span></p>
            <p className="pl-12 text-slate-400">├── 📁 repositories/ <span className="text-slate-600">-- Spring Data JPA interfaces</span></p>
            <p className="pl-12 text-slate-400">├── 📁 services/ <span className="text-slate-600">-- Core business logic implementations</span></p>
            <p className="pl-8 text-slate-400">└── 📁 src/main/resources/</p>
            <p className="pl-12 text-slate-500">├── application.properties <span className="text-slate-600">-- DB credentials</span></p>
            <p className="pl-12 text-slate-400">├── schema.sql <span className="text-slate-600">-- Database migrations</span></p>
            <p className="pl-8 text-emerald-500">└── pom.xml <span className="text-slate-600">-- Maven POM properties</span></p>
            
            <p className="pl-4 text-indigo-400">├── 📁 src/ <span className="text-slate-600">// High performance React App</span></p>
            <p className="pl-8 text-slate-400">├── 📁 components/ <span className="text-slate-600">-- Global modular components (Clubs, Events, Recharts)</span></p>
            <p className="pl-8 text-slate-400">├── 📁 context/ <span className="text-slate-600">-- Global State managers (Auth state context)</span></p>
            <p className="pl-8 text-slate-400">├── App.tsx <span className="text-slate-600">-- Application dynamic view coordinator</span></p>
            <p className="pl-8 text-slate-400">└── main.tsx <span className="text-slate-600">-- React client entrypoint</span></p>
          </div>
        </div>
      )}

      {/* TAB 2: DATABASE DESIGN */}
      {activeTab === "database" && (
        <div className="bg-[#16191f] border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-display font-bold text-white text-base">Relational MySQL ERD Definition</h3>
              <p className="text-xs text-slate-400 mt-0.5">Physical relational table diagrams with strong foreign keys and cascading delete integrity rules.</p>
            </div>
            <span className="text-[10px] bg-[#090a0c] text-indigo-400 border border-indigo-500/20 font-mono px-2 py-1 rounded-md uppercase">MySQL 8.0 Engine</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-[11px]">
            <div className="p-4 bg-[#090a0c] rounded-xl border border-slate-800">
              <span className="text-indigo-400 font-bold block">users ──(1:N)──&gt; club_members</span>
              <p className="text-slate-400 mt-1">Binds student records to user accounts. Tracks memberships, roles (MEMBER, VICE_PRESIDENT, PRESIDENT), and dates.</p>
            </div>
            <div className="p-4 bg-[#090a0c] rounded-xl border border-slate-800">
              <span className="text-indigo-400 font-bold block">clubs ──(1:N)──&gt; events ──(1:N)</span>
              <p className="text-slate-400 mt-1">Handles event scheduling inside approved clubs, and tracks student registrations and attendance logs.</p>
            </div>
            <div className="p-4 bg-[#090a0c] rounded-xl border border-slate-800">
              <span className="text-indigo-400 font-bold block">events ──(1:1)──&gt; certificates</span>
              <p className="text-slate-400 mt-1">Issues cryptographically unique certificate codes (e.g. CERT-HACK-2026-004) only to students marked with 'attended=true'.</p>
            </div>
          </div>

          <div className="p-4 bg-[#090a0c] border border-slate-850 rounded-xl">
            <h4 className="text-xs text-slate-400 font-mono font-bold mb-3">Database Seed Schema (SQL Script snippet)</h4>
            <pre className="font-mono text-[10px] text-slate-500 max-h-48 overflow-y-auto select-all whitespace-pre-wrap leading-relaxed">
{`CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  role_id INT NOT NULL,
  FOREIGN KEY (role_id) REFERENCES roles(id)
);

CREATE TABLE IF NOT EXISTS clubs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50),
  banner_url VARCHAR(255),
  status VARCHAR(20) DEFAULT 'PENDING',
  creator_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS club_members (
  id INT AUTO_INCREMENT PRIMARY KEY,
  club_id INT NOT NULL,
  user_id INT NOT NULL,
  role VARCHAR(20) DEFAULT 'MEMBER',
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);`}
            </pre>
          </div>
        </div>
      )}

      {/* TAB 3: SPRING BOOT CONFIG */}
      {activeTab === "springboot" && (
        <div className="bg-[#16191f] border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-display font-bold text-white text-base">Spring Boot 3 + JPA Maven Build</h3>
              <p className="text-xs text-slate-400 mt-0.5">XML project manifest (POM) properties and relational application data sources configuration.</p>
            </div>
            <span className="text-xs bg-[#090a0c] text-white font-mono px-3 py-1 rounded border border-slate-800 flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" /> Security Layer Preset
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-lg overflow-hidden border border-slate-800">
              <div className="bg-[#090a0c] px-4 py-2 text-xs font-mono text-slate-500 border-b border-slate-800">
                pom.xml properties
              </div>
              <pre className="p-4 bg-[#090a0c]/40 font-mono text-[11px] text-slate-300 max-h-56 overflow-y-auto">
{`<!-- Dependencies configured in Maven -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
<dependency>
    <groupId>com.mysql</groupId>
    <artifactId>mysql-connector-j</artifactId>
    <scope>runtime</scope>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.12.5</version>
</dependency>`}
              </pre>
            </div>

            <div className="rounded-lg overflow-hidden border border-slate-800">
              <div className="bg-[#090a0c] px-4 py-2 text-xs font-mono text-slate-500 border-b border-slate-800">
                application.properties datasource configuration
              </div>
              <pre className="p-4 bg-[#090a0c]/40 font-mono text-[11px] text-indigo-400/90 max-h-56 overflow-y-auto">
{`spring.datasource.url=jdbc:mysql://localhost:3306/clubsphere
spring.datasource.username=root
spring.datasource.password=root123
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA Hibernate optimization
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect

# JWT Simulation secrets
jwt.secret=6366f1eCellMusicWizardsDoubleEncryptedHMACSecret2026`}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
