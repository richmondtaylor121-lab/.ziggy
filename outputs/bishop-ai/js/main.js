/**
 * Bishop AI Website Interactivity Logic
 * Developed under the FORGES Framework
 */

document.addEventListener('DOMContentLoaded', () => {
  initMobileNavigation();
  initFaqAccordion();
  initTabsSystem();
  initFormValidation();
  initSmoothScroll();
  initRadialTimeline();
});

/**
 * Mobile Navigation Menu Toggle
 */
function initMobileNavigation() {
  const toggleBtn = document.querySelector('.header-nav__toggle');
  const navMenu = document.querySelector('.header-nav__menu');

  if (!toggleBtn || !navMenu) return;

  toggleBtn.addEventListener('click', () => {
    const isExpanded = toggleBtn.getAttribute('aria-expanded') === 'true';
    toggleBtn.setAttribute('aria-expanded', !isExpanded);
    navMenu.classList.toggle('header-nav__menu--open');
  });

  // Close menu on link click
  const navLinks = document.querySelectorAll('.header-nav__link');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      toggleBtn.setAttribute('aria-expanded', 'false');
      navMenu.classList.remove('header-nav__menu--open');
    });
  });
}

/**
 * FAQ Accordion Toggles
 */
function initFaqAccordion() {
  const faqTriggers = document.querySelectorAll('.faq-item__trigger');

  faqTriggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      const parent = trigger.parentElement;
      const content = parent.querySelector('.faq-item__content');
      const isExpanded = trigger.getAttribute('aria-expanded') === 'true';

      // Toggle state
      trigger.setAttribute('aria-expanded', !isExpanded);

      if (!isExpanded) {
        // Expand
        content.style.maxHeight = content.scrollHeight + 'px';
      } else {
        // Collapse
        content.style.maxHeight = '0px';
      }

      // Optional: collapse other open items (accordion behavior)
      faqTriggers.forEach(otherTrigger => {
        if (otherTrigger !== trigger && otherTrigger.getAttribute('aria-expanded') === 'true') {
          otherTrigger.setAttribute('aria-expanded', 'false');
          otherTrigger.parentElement.querySelector('.faq-item__content').style.maxHeight = '0px';
        }
      });
    });
  });
}

/**
 * Tab and Filter Switching Systems (Services and Blog Categories)
 */
function initTabsSystem() {
  const tabGroups = document.querySelectorAll('[data-tab-group]');

  tabGroups.forEach(group => {
    const tabButtons = group.querySelectorAll('[data-tab-target]');
    const tabContents = group.querySelectorAll('[data-tab-content]');

    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        const target = button.getAttribute('data-tab-target');

        // Update active class on buttons
        tabButtons.forEach(btn => btn.classList.remove('tab-btn--active'));
        button.classList.add('tab-btn--active');

        // Show/Hide target content
        tabContents.forEach(content => {
          const contentId = content.getAttribute('data-tab-content');
          if (target === 'all' || contentId === target) {
            content.classList.add('tab-content--active');
          } else {
            content.classList.remove('tab-content--active');
          }
        });
      });
    });
  });
}

/**
 * Client-Side Contact Form Validation
 */
function initFormValidation() {
  const forms = document.querySelectorAll('form[data-validate]');

  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      let isValid = true;

      // Find required fields
      const requiredInputs = form.querySelectorAll('[required]');

      requiredInputs.forEach(input => {
        const errorMsg = input.parentElement.querySelector('.form-error-msg');
        let isFieldValid = true;

        if (input.type === 'email') {
          // Email validation regex
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          isFieldValid = emailRegex.test(input.value.trim());
        } else if (input.tagName === 'SELECT') {
          isFieldValid = input.value !== '';
        } else {
          isFieldValid = input.value.trim() !== '';
        }

        if (!isFieldValid) {
          isValid = false;
          input.style.borderColor = 'var(--destructive)';
          if (errorMsg) {
            errorMsg.style.display = 'block';
          }
        } else {
          input.style.borderColor = 'var(--border)';
          if (errorMsg) {
            errorMsg.style.display = 'none';
          }
        }
      });

      if (!isValid) {
        e.preventDefault(); // Stop submission
      }
    });

    // Reset error styling on input
    form.querySelectorAll('input, select, textarea').forEach(input => {
      input.addEventListener('input', () => {
        input.style.borderColor = '';
        const errorMsg = input.parentElement.querySelector('.form-error-msg');
        if (errorMsg) {
          errorMsg.style.display = 'none';
        }
      });
    });
  });
}

/**
 * Accessible Smooth Scrolling for Anchors
 */
function initSmoothScroll() {
  const anchors = document.querySelectorAll('a[href^="#"]');

  anchors.forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#') return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();
      
      target.scrollIntoView({
        behavior: 'smooth'
      });

      // Update focus for screenreaders
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });
  });
}

/**
 * Interactive Radial Orbital Timeline System
 */
function initRadialTimeline() {
  const container = document.getElementById('orbit-container');
  if (!container) return;

  // Timeline stage data
  const timelineData = [
    {
      id: 1,
      title: "Operational Audit & Planning",
      stage: "Stage 01",
      content: "Complete operational gap audit. We map GTM database systems and locate major time-leaks.",
      status: "completed",
      energy: 100,
      icon: `<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`,
      relatedIds: [2]
    },
    {
      id: 2,
      title: "GTM System Architecture",
      stage: "Stage 02",
      content: "Designing clean CRM integration schemas, database filters, and custom n8n middleware diagrams.",
      status: "completed",
      energy: 90,
      icon: `<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`,
      relatedIds: [1, 3]
    },
    {
      id: 3,
      title: "Middleware & Pipeline Build",
      stage: "Stage 03",
      content: "Writing custom API connectors, n8n workflow routines, and Salesforce lead-routing properties.",
      status: "in-progress",
      energy: 60,
      icon: `<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>`,
      relatedIds: [2, 4]
    },
    {
      id: 4,
      title: "Sandbox Simulation & Tests",
      stage: "Stage 04",
      content: "Running GTM simulations in sandbox staging environments to verify data compliance and routing speed.",
      status: "pending",
      energy: 30,
      icon: `<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`,
      relatedIds: [3, 5]
    },
    {
      id: 5,
      title: "Production Launch & Training",
      stage: "Stage 05",
      content: "Deploying live integration engines and delivering custom prompt engineering manuals for sales staff.",
      status: "pending",
      energy: 10,
      icon: `<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`,
      relatedIds: [4]
    }
  ];

  // State Management
  let activeNodeId = null;
  let rotationAngle = 0;
  let autoRotate = true;
  let targetAngle = null;
  
  // Create DOM structure
  const workspace = document.createElement('div');
  workspace.className = 'orbit-workspace';
  container.appendChild(workspace);

  // 1. Render Orbit Track Circle
  const track = document.createElement('div');
  track.className = 'orbit-track-circle';
  workspace.appendChild(track);

  // 2. Render Central Node (Bishop AI Core)
  const centerNode = document.createElement('div');
  centerNode.className = 'orbit-center-node';
  centerNode.innerHTML = `<span style="font-weight: 800; font-size: 1.5rem; letter-spacing: -0.05em; color: #000D1A;">B</span>`;
  workspace.appendChild(centerNode);

  // Render Central Glowing rings
  const ring1 = document.createElement('div');
  ring1.className = 'orbit-center-ring orbit-center-ring-1';
  const ring2 = document.createElement('div');
  ring2.className = 'orbit-center-ring orbit-center-ring-2';
  workspace.appendChild(ring1);
  workspace.appendChild(ring2);

  // 3. Render Detail Card
  const detailCard = document.createElement('div');
  detailCard.className = 'orbit-detail-card';
  workspace.appendChild(detailCard);

  // 4. Render Stage Nodes
  const nodeWrappers = [];
  
  timelineData.forEach((item, index) => {
    const nodeWrapper = document.createElement('div');
    nodeWrapper.className = 'orbit-node-wrapper';
    nodeWrapper.dataset.id = item.id;
    
    // Background Pulse
    const pulse = document.createElement('div');
    pulse.className = 'orbit-node-energy-pulse';
    pulse.style.width = `${item.energy * 0.5 + 40}px`;
    pulse.style.height = `${item.energy * 0.5 + 40}px`;
    
    // Core Node Button
    const node = document.createElement('div');
    node.className = `orbit-node orbit-node--${item.status}`;
    node.innerHTML = item.icon;
    
    // Text Label below Node
    const label = document.createElement('div');
    label.className = 'orbit-node-label';
    label.innerText = item.title.split('. ')[1] || item.title;

    nodeWrapper.appendChild(pulse);
    nodeWrapper.appendChild(node);
    nodeWrapper.appendChild(label);
    workspace.appendChild(nodeWrapper);
    
    nodeWrappers.push({
      element: nodeWrapper,
      data: item,
      index: index
    });

    // Node click handler
    nodeWrapper.addEventListener('click', (e) => {
      e.stopPropagation();
      selectNode(item.id);
    });
  });

  // Center node click handler to toggle/reset
  centerNode.addEventListener('click', (e) => {
    e.stopPropagation();
    resetTimeline();
  });

  // Click off handler (workspace resets active node)
  container.addEventListener('click', (e) => {
    if (e.target === container || e.target === workspace) {
      resetTimeline();
    }
  });

  // Select node action
  function selectNode(id) {
    if (activeNodeId === id) {
      resetTimeline();
      return;
    }
    
    activeNodeId = id;
    autoRotate = false;
    
    // Update active node styling
    nodeWrappers.forEach(wrap => {
      const isCurrent = wrap.data.id === id;
      const isRelated = wrap.data.relatedIds.includes(id) || timelineData.find(i => i.id === id).relatedIds.includes(wrap.data.id);
      
      wrap.element.classList.toggle('is-active', isCurrent);
      wrap.element.classList.toggle('is-pulsing', isRelated && !isCurrent);
    });

    const activeItem = timelineData.find(item => item.id === id);
    populateCard(activeItem);

    // Calculate transition target angle to bring active node to the front (bottom - 90 deg, or top - 270 deg)
    const nodeIndex = timelineData.findIndex(item => item.id === id);
    const itemTargetAngle = (nodeIndex / timelineData.length) * 360;
    
    // We want the clicked node to transition to front bottom (90 deg) or front top (270 deg)
    // Let's bring it to bottom (90 deg) for optimal reading of the overlay card
    targetAngle = (90 - itemTargetAngle) % 360;
    if (targetAngle < 0) targetAngle += 360;
  }

  // Populates the detail card
  function populateCard(item) {
    const statusLabel = item.status === 'completed' ? 'Complete' : item.status === 'in-progress' ? 'In Progress' : 'Pending';
    
    // Generate Related Buttons
    let relatedButtonsHTML = '';
    if (item.relatedIds && item.relatedIds.length > 0) {
      item.relatedIds.forEach(relId => {
        const relItem = timelineData.find(i => i.id === relId);
        if (relItem) {
          relatedButtonsHTML += `
            <button class="orbit-connection-btn" data-target="${relId}">
              ${relItem.title.split('. ')[1] || relItem.title}
              <svg viewBox="0 0 24 24" width="10" height="10" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </button>
          `;
        }
      });
    }

    detailCard.innerHTML = `
      <div class="orbit-card-header">
        <span class="orbit-card-badge orbit-card-badge--${item.status}">${statusLabel}</span>
        <span class="orbit-card-stage-num">${item.stage}</span>
      </div>
      <h3 class="orbit-card-title">${item.title}</h3>
      <p class="orbit-card-desc">${item.content}</p>
      
      <div class="orbit-energy-section">
        <div class="orbit-energy-label">
          <span class="orbit-energy-label-left">
            <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
            System Readiness
          </span>
          <span>${item.energy}%</span>
        </div>
        <div class="orbit-energy-bar-bg">
          <div class="orbit-energy-bar-fill" id="orbit-energy-fill"></div>
        </div>
      </div>
      
      ${relatedButtonsHTML ? `
      <div class="orbit-connections-section">
        <h4 class="orbit-connections-title">
          <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
          Connected Lifecycle Stages
        </h4>
        <div class="orbit-connections-list">
          ${relatedButtonsHTML}
        </div>
      </div>
      ` : ''}
    `;

    detailCard.classList.add('is-visible');
    
    // Trigger progress bar load after a short delay
    setTimeout(() => {
      const fill = document.getElementById('orbit-energy-fill');
      if (fill) fill.style.width = `${item.energy}%`;
    }, 50);

    // Bind listeners to related buttons inside card
    detailCard.querySelectorAll('.orbit-connection-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const targetId = parseInt(btn.dataset.target);
        selectNode(targetId);
      });
    });
  }

  // Reset/Deselect action
  function resetTimeline() {
    activeNodeId = null;
    autoRotate = true;
    targetAngle = null;
    
    nodeWrappers.forEach(wrap => {
      wrap.element.classList.remove('is-active', 'is-pulsing');
    });
    
    detailCard.classList.remove('is-visible');
  }

  // Continuous animation frame loop
  function updateAnimation() {
    // Determine responsive orbit radius
    const isMobile = window.innerWidth < 768;
    const radius = isMobile ? 100 : 200;

    if (autoRotate) {
      // Slow rotation increment
      rotationAngle = (rotationAngle + 0.15) % 360;
    } else if (targetAngle !== null) {
      // Smoothly interpolate rotationAngle towards targetAngle
      let diff = targetAngle - rotationAngle;
      // Normalise difference to shortest rotation path (-180 to 180)
      diff = ((diff + 180) % 360) - 180;
      
      if (Math.abs(diff) > 0.1) {
        rotationAngle = (rotationAngle + diff * 0.1) % 360;
      } else {
        rotationAngle = targetAngle;
        targetAngle = null;
      }
    }

    // Reposition all node elements
    nodeWrappers.forEach(wrap => {
      const angleDegrees = ((wrap.index / timelineData.length) * 360 + rotationAngle) % 360;
      const angleRadians = (angleDegrees * Math.PI) / 180;
      
      const x = Math.round(radius * Math.cos(angleRadians));
      const y = Math.round(radius * Math.sin(angleRadians));
      
      // Depth parameters
      const depthZ = Math.round(100 + 50 * Math.sin(angleRadians));
      const isCurrentActive = wrap.data.id === activeNodeId;
      
      // Calculate opacity for standard nodes (more opaque when closer in foreground)
      const depthFactor = (1 + Math.sin(angleRadians)) / 2; // ranges 0 to 1
      const baseOpacity = isMobile ? 1 : Math.max(0.4, 0.4 + 0.6 * depthFactor);
      const opacity = isCurrentActive ? 1 : baseOpacity;

      wrap.element.style.transform = `translate(${x}px, ${y}px)`;
      wrap.element.style.zIndex = isCurrentActive ? 200 : depthZ;
      wrap.element.style.opacity = opacity;
    });

    requestAnimationFrame(updateAnimation);
  }

  // Start rotation loop
  updateAnimation();
}

