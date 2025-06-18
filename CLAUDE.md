# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**ngfire** is an unofficial Angular library that provides a simplified, opinionated wrapper around Firebase SDK for Angular applications. It's built as an Nx monorepo with Angular 15, TypeScript, and Firebase v9.

## Common Commands

### Development
- `npm start` - Start the playground app for development
- `npm run build` - Build the ngfire-schematics library
- `npm run publish` - Publish the ngfire library
- `npm test` - Run unit tests
- `npm run lint` - Run workspace linting and Angular linting
- `npm run e2e` - Run end-to-end tests

### Nx-specific Commands
- `nx affected:build` - Build affected projects
- `nx affected:test` - Test affected projects
- `nx affected:lint` - Lint affected projects
- `nx dep-graph` - View dependency graph
- `nx format:write` - Format code

### Firebase Emulator
- `firebase emulators:start` - Start Firebase emulators (ports defined in firebase.json)
- Emulator ports: Firestore (8000), Auth (9099), Functions (5001), Database (9000), Storage (9199), UI (4000)

## Architecture

### Monorepo Structure
- **Nx workspace** with Angular 15 and Firebase v9
- **Main library**: `libs/ngfire/` - Modular Firebase services
- **Playground app**: `apps/playground/` - Demo application
- **Schematics**: `libs/ngfire/schematics/` - Angular CLI setup tools

### Library Modules (`libs/ngfire/`)
- `analytics/` - Firebase Analytics
- `app/` - Firebase App initialization
- `auth/` - Authentication services
- `core/` - Core utilities and RxJS operators
- `database/` - Realtime Database
- `emulators/` - Emulator configuration helpers
- `firestore/` - Main Firestore services (FireCollection, FireSubcollection)
- `functions/` - Cloud Functions
- `storage/` - Cloud Storage
- `tokens/` - DI tokens
- `webworker/` - Web worker support

### Core Services
- **FireCollection**: Main service for Firestore collections with CRUD operations, caching, and RxJS observables
- **FireSubcollection**: Extended service for Firestore subcollections with collection group queries
- **Emulator helpers**: Utilities for local Firebase emulator development

### Key Features
- **Reactive programming**: Built on RxJS observables
- **Request memorization**: Built-in caching with `memorize` option
- **Batch/Transaction support**: Atomic operations across multiple documents
- **SSR support**: TransferState integration for server-side rendering
- **TypeScript path mapping**: Clean imports like `import { FireCollection } from 'ngfire/firestore'`

## Development Setup

### Prerequisites
- Firebase project initialized with `firebase init`
- Firebase tools installed: `npm install -D firebase-tools`

### Configuration
Environment files should configure Firebase options and emulator settings:
- `environment.ts` - Uses Firebase emulators for development
- `environment.prod.ts` - Uses production Firebase configuration
- App module needs `FIREBASE_CONFIG` provider

### Testing
- **Unit tests**: Jest with `jest-preset-angular`
- **E2E tests**: Cypress
- **Linting**: ESLint with Angular-specific rules

### Library Publishing
- Build with `npm run build` (builds ngfire-schematics)
- Publish with `npm run publish` (publishes ngfire library)
- Uses ng-packagr for library packaging

## Firebase Integration

The library provides simplified APIs for:
- Collection/document CRUD operations with `FireCollection`
- Subcollection queries with `FireSubcollection`
- Batch writes and transactions
- Query caching and memorization
- Emulator support for local development
- Collection group queries for subcollections