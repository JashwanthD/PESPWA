import matplotlib.pyplot as plt
import matplotlib.patches as patches
import os

out_dir = "/mnt/data/"
def draw_box(ax, cx, cy, w, h, text, facecolor, edgecolor):
    rect = patches.Rectangle((cx - w/2, cy - h/2), w, h,
                             linewidth=2.5, edgecolor=edgecolor, facecolor=facecolor, zorder=2)
    ax.add_patch(rect)
    # Replaced newlines in strings with actual newlines in text
    ax.text(cx, cy, text, ha='center', va='center', fontsize=12, fontweight='bold', fontfamily='sans-serif', color='#111111', zorder=3)

def draw_arrow(ax, x1, y1, x2, y2):
    ax.annotate('', xy=(x2, y2), xytext=(x1, y1),
                arrowprops=dict(arrowstyle="-|>,head_width=0.5,head_length=0.7", lw=2.5, color='#333333'), zorder=1)

# Set common style
plt.style.use('default')

# FIGURE 1
fig1, ax1 = plt.subplots(figsize=(14, 4.5))
ax1.set_xlim(0, 24)
ax1.set_ylim(0, 8)
ax1.axis('off')
ax1.set_title("Fig. 1: Predictive Sowing Analytics using Ensemble Models", fontsize=16, fontweight='bold', pad=15)
c1 = ('#E8F5E9', '#2E7D32')
draw_box(ax1, 3, 6.5, 5, 2, "ICAR Historical\nWeather Data", *c1)
draw_box(ax1, 3, 1.5, 5, 2, "Soil N-P-K\nProfiles", *c1)
draw_box(ax1, 9, 4, 5, 2, "Data Preprocessing\n(Pandas / Scikit-Learn)", *c1)
draw_box(ax1, 15, 4, 5, 2, "XGBoost & Random\nForest Ensembles", *c1)
draw_box(ax1, 21, 4, 5, 2, "Optimal Crop &\nSowing Window", *c1)

draw_arrow(ax1, 5.5, 6.5, 6.5, 4.5)
draw_arrow(ax1, 5.5, 1.5, 6.5, 3.5)
draw_arrow(ax1, 11.5, 4, 12.5, 4)
draw_arrow(ax1, 17.5, 4, 18.5, 4)
fig1_path = os.path.join(out_dir, "Fig_1_Predictive_Sowing.png")
fig1.savefig(fig1_path, bbox_inches='tight', dpi=300)

# FIGURE 2
fig2, ax2 = plt.subplots(figsize=(16, 3.5))
ax2.set_xlim(0, 30)
ax2.set_ylim(0, 8)
ax2.axis('off')
ax2.set_title("Fig. 2: MobileNetV2 CNN Architecture for Leaf Pathology", fontsize=16, fontweight='bold', pad=15)
c2 = ('#F3E5F5', '#6A1B9A')
draw_box(ax2, 3, 4, 5, 3, "Smartphone Camera\n(Leaf Image Capture)", *c2)
draw_box(ax2, 9, 4, 5, 3, "MobileNetV2 CNN\n(Depthwise Separable)", *c2)
draw_box(ax2, 15, 4, 5, 3, "TensorFlow Lite\n(8-bit Quantization)", *c2)
draw_box(ax2, 21, 4, 5, 3, "Offline On-Device\nEdge Inference", *c2)
draw_box(ax2, 27, 4, 5, 3, "Classification:\nRice Blast or\nSugarcane Red Rot", *c2)

draw_arrow(ax2, 5.5, 4, 6.5, 4)
draw_arrow(ax2, 11.5, 4, 12.5, 4)
draw_arrow(ax2, 17.5, 4, 18.5, 4)
draw_arrow(ax2, 23.5, 4, 24.5, 4)
fig2_path = os.path.join(out_dir, "Fig_2_MobileNetV2_CNN.png")
fig2.savefig(fig2_path, bbox_inches='tight', dpi=300)

# FIGURE 3
fig3, ax3 = plt.subplots(figsize=(16, 3.5))
ax3.set_xlim(0, 30)
ax3.set_ylim(0, 8)
ax3.axis('off')
ax3.set_title("Fig. 3: Time-Series Market Forecasting using LSTM", fontsize=16, fontweight='bold', pad=15)
c3 = ('#FFF3E0', '#EF6C00')
draw_box(ax3, 3, 4, 5, 3, "Agmarknet Mandi\nDataset (CSV)", *c3)
draw_box(ax3, 9, 4, 5, 3, "PySpark Distributed\nDataFrames (ETL)", *c3)
draw_box(ax3, 15, 4, 5, 3, "Time-Series\nFeature Sequencing", *c3)
draw_box(ax3, 21, 4, 5, 3, "Long Short-Term\nMemory (LSTM)", *c3)
draw_box(ax3, 27, 4, 5, 3, "30-Day Price Forecast\n& Sell/Hold Signal", *c3)

draw_arrow(ax3, 5.5, 4, 6.5, 4)
draw_arrow(ax3, 11.5, 4, 12.5, 4)
draw_arrow(ax3, 17.5, 4, 18.5, 4)
draw_arrow(ax3, 23.5, 4, 24.5, 4)
fig3_path = os.path.join(out_dir, "Fig_3_LSTM_Market.png")
fig3.savefig(fig3_path, bbox_inches='tight', dpi=300)

# FIGURE 4
fig4, ax4 = plt.subplots(figsize=(12, 8))
ax4.set_xlim(0, 20)
ax4.set_ylim(0, 12)
ax4.axis('off')
ax4.set_title("Fig. 4: KRI-SANJEEVINI System Architecture Pipeline", fontsize=16, fontweight='bold', pad=15)
c_base = ('#E3F2FD', '#1565C0')
draw_box(ax4, 10, 10, 8, 2, "Farmer User Interface\n(Bhashini Multilingual Voice SDK)", *c_base)
draw_box(ax4, 4, 6, 5.5, 2.5, "Module A:\nPredictive Sowing\n(Tabular ML)", *c1)
draw_box(ax4, 10, 6, 5.5, 2.5, "Module B:\nLeaf Pathology CV\n(Edge CNN)", *c2)
draw_box(ax4, 16, 6, 5.5, 2.5, "Module C:\nMarket Forecasting\n(Distributed RNN)", *c3)
draw_box(ax4, 10, 2, 8, 2, "Multimodal Agronomic Advisory\n(Actionable Voice Output)", *c_base)

draw_arrow(ax4, 10, 9, 10, 7.25)
draw_arrow(ax4, 8, 9, 4, 7.25)
draw_arrow(ax4, 12, 9, 16, 7.25)

draw_arrow(ax4, 4, 4.75, 8, 3)
draw_arrow(ax4, 10, 4.75, 10, 3)
draw_arrow(ax4, 16, 4.75, 12, 3)
fig4_path = os.path.join(out_dir, "Fig_4_System_Architecture.png")
fig4.savefig(fig4_path, bbox_inches='tight', dpi=300)

print(f"Generated images: {fig1_path}, {fig2_path}, {fig3_path}, {fig4_path}")