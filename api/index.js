/**
 * 👑 AMANTRANLINK — VERCEL SERVERLESS API ENTRY POINT
 * Adapt existing Express application into Vercel Serverless Function Handler
 * Host: https://amantranlink.in/api/*
 */

import app from '../server.js';

export default function handler(req, res) {
  return app(req, res);
}
